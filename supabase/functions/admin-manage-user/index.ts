// Admin user management — manual creation, update, password reset, status, delete.
// Requires the caller to be an authenticated admin. Super-admin-only for create/delete/reset.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SUPER_ADMIN_EMAIL = "delilar.shop@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // 1. Verify caller
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: userRes } = await userClient.auth.getUser();
  const caller = userRes?.user;
  if (!caller) return json(401, { error: "Not authenticated" });

  const admin = createClient(url, service);

  // Check caller has admin role OR is the seeded super admin email
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", caller.id);
  const roleSet = new Set((roles ?? []).map((r) => r.role));
  const isSeedSuper = (caller.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isSuper = isSeedSuper || roleSet.has("super_admin");
  const isAdmin = isSuper || roleSet.has("admin");
  if (!isAdmin) return json(403, { error: "Admin access required" });

  let payload: any;
  try { payload = await req.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  const action = payload.action as string;

  try {
    switch (action) {
      case "create": {
        if (!isSuper) return json(403, { error: "Super admin required to create admins" });
        const { email, password, full_name, username, phone, role, status, avatar_url, department, notes } = payload;
        if (!email || !password || !full_name) return json(400, { error: "email, password and full_name are required" });
        if (String(password).length < 8) return json(400, { error: "Password must be at least 8 characters" });
        const validRoles = new Set(["admin", "super_admin", "manager", "editor"]);
        const useRole = validRoles.has(role) ? role : "admin";

        // Create auth user (confirmed, no invitation email)
        const { data: created, error: ce } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        });
        if (ce || !created.user) return json(400, { error: ce?.message ?? "Failed to create user" });
        const uid = created.user.id;

        // Upsert profile (trigger may have created a row)
        const { error: pe } = await admin.from("profiles").upsert({
          id: uid,
          email,
          full_name,
          username: username || null,
          phone: phone || null,
          avatar_url: avatar_url || null,
          department: department || null,
          notes: notes || null,
          status: status || "active",
        });
        if (pe) return json(400, { error: pe.message });

        // Assign role
        const { error: re } = await admin.from("user_roles").insert({ user_id: uid, role: useRole });
        if (re && !re.message.includes("duplicate")) return json(400, { error: re.message });

        return json(200, { ok: true, user_id: uid });
      }

      case "update": {
        const { user_id, full_name, username, phone, avatar_url, department, notes, status, role } = payload;
        if (!user_id) return json(400, { error: "user_id required" });
        const { error: pe } = await admin.from("profiles").update({
          ...(full_name !== undefined && { full_name }),
          ...(username !== undefined && { username: username || null }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(avatar_url !== undefined && { avatar_url: avatar_url || null }),
          ...(department !== undefined && { department: department || null }),
          ...(notes !== undefined && { notes: notes || null }),
          ...(status !== undefined && { status }),
        }).eq("id", user_id);
        if (pe) return json(400, { error: pe.message });

        if (role && isSuper) {
          const validRoles = new Set(["admin", "super_admin", "manager", "editor"]);
          if (!validRoles.has(role)) return json(400, { error: "Invalid role" });
          await admin.from("user_roles").delete().eq("user_id", user_id);
          const { error: re } = await admin.from("user_roles").insert({ user_id, role });
          if (re) return json(400, { error: re.message });
        }
        return json(200, { ok: true });
      }

      case "reset_password": {
        if (!isSuper) return json(403, { error: "Super admin required" });
        const { user_id, password } = payload;
        if (!user_id || !password) return json(400, { error: "user_id and password required" });
        if (String(password).length < 8) return json(400, { error: "Password must be at least 8 characters" });
        const { error } = await admin.auth.admin.updateUserById(user_id, { password });
        if (error) return json(400, { error: error.message });
        return json(200, { ok: true });
      }

      case "set_status": {
        const { user_id, status } = payload;
        if (!user_id || !status) return json(400, { error: "user_id and status required" });
        const { error } = await admin.from("profiles").update({ status }).eq("id", user_id);
        if (error) return json(400, { error: error.message });
        // If suspended/inactive, sign out all sessions
        if (status !== "active") {
          await admin.auth.admin.signOut(user_id).catch(() => {});
        }
        return json(200, { ok: true });
      }

      case "delete": {
        if (!isSuper) return json(403, { error: "Super admin required" });
        const { user_id } = payload;
        if (!user_id) return json(400, { error: "user_id required" });
        if (user_id === caller.id) return json(400, { error: "Cannot delete yourself" });
        const { error } = await admin.auth.admin.deleteUser(user_id);
        if (error) return json(400, { error: error.message });
        return json(200, { ok: true });
      }

      default:
        return json(400, { error: "Unknown action" });
    }
  } catch (e: any) {
    return json(500, { error: e?.message ?? "Server error" });
  }
});
