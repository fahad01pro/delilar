import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  Loader2,
  LogOut,
  Mail,
  Package,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  Upload,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL, isAdminUser } from '@/lib/admin';
import { categories as staticCategories } from '@/data/products';
import { resolveImage } from '@/lib/imageAssets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AdminTab = 'overview' | 'products' | 'orders' | 'customers' | 'subscribers' | 'inventory' | 'outlets' | 'content' | 'settings';
type ProductType = 'clothing' | 'accessories' | 'perfume';

type ColorVariantDraft = { name: string; hex: string; sku?: string; stock?: string; images: [string, string] };

type ProductRow = {
  id: string;
  name: string;
  subtitle?: string | null;
  category: string;
  product_type: ProductType | string;
  brand?: string | null;
  sku?: string | null;
  price: number;
  original_price?: number | null;
  stock: number;
  description?: string | null;
  badge?: string | null;
  in_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_sale: boolean;
  is_visible: boolean;
  rating: number;
  reviews: number;
  tags?: string[] | null;
  data: any;
  sort_order: number;
  created_at?: string;
};

type ProductDraft = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  product_type: ProductType;
  sku: string;
  price: string;
  original_price: string;
  stock: string;
  description: string;
  badge: string;
  tagsText: string;
  image: string;
  imagesText: string;
  sizesText: string;
  colorsText: string;
  colorVariants: ColorVariantDraft[];
  fabricText: string;
  material: string;
  fitType: string;
  volumeOptionsText: string;
  is_featured: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_visible: boolean;
  sort_order: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  shipping_address?: any;
  payment_method: string;
  status: string;
  tracking_number?: string | null;
  courier?: string | null;
  tracking_url?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
};

type ProfileRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  secondary_phone?: string | null;
  district?: string | null;
  upazila?: string | null;
  village?: string | null;
  house_number?: string | null;
  detailed_address?: string | null;
  address?: string | null;
  city?: string | null;
  created_at?: string;
};

type CategoryRow = {
  id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order: number;
  enabled: boolean;
};

type HeroBannerRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  eyebrow?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  enabled: boolean;
  sort_order: number;
};

type CategoryBannerRow = {
  id: string;
  category: string;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
  enabled: boolean;
};

type ContentRow = {
  id: string;
  content_key: string;
  type: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  data?: any;
  enabled: boolean;
  sort_order: number;
};

type RoleRow = { id: string; user_id: string; role: string };

type CategoryDraft = { id: string; name: string; description: string; image_url: string; sort_order: string; enabled: boolean };
type BannerDraft = { id?: string; title: string; subtitle: string; eyebrow: string; image_url: string; mobile_image_url: string; cta_label: string; cta_href: string; sort_order: string; enabled: boolean };
type CategoryBannerDraft = { id?: string; category: string; title: string; subtitle: string; image_url: string; enabled: boolean };
type ContentDraft = { id?: string; content_key: string; type: string; title: string; subtitle: string; body: string; image_url: string; cta_label: string; cta_href: string; sort_order: string; enabled: boolean };

const db = supabase as any;

const productTypes: ProductType[] = ['clothing', 'accessories', 'perfume'];
const orderStatuses = ['warehouse', 'packaging', 'transit', 'delivered', 'cancelled', 'refunded'];
const reservedRoutes = new Set(['admin', 'account', 'wishlist', 'cart', 'about', 'contact', 'product']);

const emptyProductDraft = (category = 'jubba'): ProductDraft => ({
  id: '',
  name: '',
  subtitle: '',
  category,
  product_type: 'clothing',
  sku: '',
  price: '',
  original_price: '',
  stock: '0',
  description: '',
  badge: '',
  tagsText: '',
  image: '',
  imagesText: '',
  sizesText: 'S, M, L, XL, 2XL',
  colorsText: '',
  colorVariants: [],
  fabricText: '',
  material: '',
  fitType: '',
  volumeOptionsText: '',
  is_featured: false,
  is_new: false,
  is_trending: false,
  is_visible: true,
  sort_order: '0',
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const money = (value: number | string | null | undefined) => `৳${Number(value ?? 0).toLocaleString()}`;
const shortId = (id: string) => id.slice(0, 8).toUpperCase();

const normalizeVariants = (raw: any): ColorVariantDraft[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((cv: any) => {
    const images = Array.isArray(cv?.images) ? cv.images : [];
    return {
      name: String(cv?.name ?? ''),
      hex: String(cv?.hex ?? '#000000'),
      sku: cv?.sku ? String(cv.sku) : '',
      stock: cv?.stock !== undefined && cv?.stock !== null ? String(cv.stock) : '',
      images: [String(images[0] ?? ''), String(images[1] ?? '')] as [string, string],
    };
  });
};

const productToDraft = (product: ProductRow): ProductDraft => ({
  id: product.id,
  name: product.name ?? '',
  subtitle: product.subtitle ?? '',
  category: product.category ?? 'jubba',
  product_type: (product.product_type as ProductType) ?? 'clothing',
  sku: product.sku ?? '',
  price: String(product.price ?? ''),
  original_price: product.original_price ? String(product.original_price) : '',
  stock: String(product.stock ?? 0),
  description: product.description ?? '',
  badge: product.badge ?? '',
  tagsText: (product.tags ?? []).join(', '),
  image: product.data?.image ?? '',
  imagesText: (product.data?.images ?? []).join('\n'),
  sizesText: (product.data?.sizes ?? []).join(', '),
  colorsText: (product.data?.colors ?? []).join(', '),
  colorVariants: normalizeVariants(product.data?.colorVariants),
  fabricText: (product.data?.fabric ?? []).join(', '),
  material: product.data?.material ?? '',
  fitType: product.data?.fitType ?? '',
  volumeOptionsText: (product.data?.volumeOptions ?? []).join(', '),
  is_featured: !!product.is_featured,
  is_new: !!product.is_new,
  is_trending: !!product.is_trending,
  is_visible: !!product.is_visible,
  sort_order: String(product.sort_order ?? 0),
});

const categoryToDraft = (category?: CategoryRow): CategoryDraft => ({
  id: category?.id ?? '',
  name: category?.name ?? '',
  description: category?.description ?? '',
  image_url: category?.image_url ?? '',
  sort_order: String(category?.sort_order ?? 0),
  enabled: category?.enabled ?? true,
});

const bannerToDraft = (banner?: HeroBannerRow): BannerDraft => ({
  id: banner?.id,
  title: banner?.title ?? '',
  subtitle: banner?.subtitle ?? '',
  eyebrow: banner?.eyebrow ?? '',
  image_url: banner?.image_url ?? '',
  mobile_image_url: banner?.mobile_image_url ?? '',
  cta_label: banner?.cta_label ?? '',
  cta_href: banner?.cta_href ?? '',
  sort_order: String(banner?.sort_order ?? 0),
  enabled: banner?.enabled ?? true,
});

const categoryBannerToDraft = (banner?: CategoryBannerRow): CategoryBannerDraft => ({
  id: banner?.id,
  category: banner?.category ?? 'jubba',
  title: banner?.title ?? '',
  subtitle: banner?.subtitle ?? '',
  image_url: banner?.image_url ?? '',
  enabled: banner?.enabled ?? true,
});

const contentToDraft = (content?: ContentRow): ContentDraft => ({
  id: content?.id,
  content_key: content?.content_key ?? '',
  type: content?.type ?? 'section',
  title: content?.title ?? '',
  subtitle: content?.subtitle ?? '',
  body: content?.body ?? '',
  image_url: content?.image_url ?? '',
  cta_label: content?.cta_label ?? '',
  cta_href: content?.cta_href ?? '',
  sort_order: String(content?.sort_order ?? 0),
  enabled: content?.enabled ?? true,
});

const Admin = () => {
  const { user, loading: authLoading, openAuthModal, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.split('/')[2] as AdminTab | undefined;
  const activeTab: AdminTab = segment && ['overview', 'products', 'orders', 'customers', 'subscribers', 'inventory', 'content', 'settings'].includes(segment) ? segment : 'overview';

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [productCategories, setProductCategories] = useState<CategoryRow[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBannerRow[]>([]);
  const [categoryBanners, setCategoryBanners] = useState<CategoryBannerRow[]>([]);
  const [siteContent, setSiteContent] = useState<ContentRow[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; source: string; created_at: string }[]>([]);
  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [bannerDraft, setBannerDraft] = useState<BannerDraft | null>(null);
  const [categoryBannerDraft, setCategoryBannerDraft] = useState<CategoryBannerDraft | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentDraft | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, Partial<OrderRow>>>({});
  const [uploading, setUploading] = useState(false);

  const categoryOptions = useMemo(() => {
    const merged = new Map<string, { id: string; name: string; description?: string }>();
    staticCategories.forEach((cat) => merged.set(cat.slug, { id: cat.slug, name: cat.name, description: cat.description }));
    productCategories.forEach((cat) => merged.set(cat.id, { id: cat.id, name: cat.name, description: cat.description ?? undefined }));
    return [...merged.values()].filter((cat) => !reservedRoutes.has(cat.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [productCategories]);

  const profileById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const adminRoleIds = useMemo(() => new Set(roles.filter((role) => role.role === 'admin').map((role) => role.user_id)), [roles]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (activeTab !== 'products' || !q) return products;
    return products.filter((product) => [product.name, product.id, product.category, product.sku].some((value) => String(value ?? '').toLowerCase().includes(q)));
  }, [activeTab, products, search]);

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (activeTab !== 'customers' || !q) return profiles;
    return profiles.filter((profile) => [profile.full_name, profile.email, profile.phone, profile.district, profile.id].some((value) => String(value ?? '').toLowerCase().includes(q)));
  }, [activeTab, profiles, search]);

  const selectedCustomer = selectedCustomerId ? profileById.get(selectedCustomerId) : null;
  const selectedCustomerOrders = selectedCustomerId ? orders.filter((order) => order.user_id === selectedCustomerId) : [];

  const revenue = orders.filter((order) => order.status !== 'cancelled' && order.status !== 'refunded').reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const lowStock = products.filter((product) => product.stock <= 5).length;
  const pendingOrders = orders.filter((order) => ['warehouse', 'packaging', 'transit'].includes(order.status)).length;

  const loadAdminData = async () => {
    if (!user) return;
    setBusy(true);
    const [productsRes, ordersRes, profilesRes, rolesRes, categoriesRes, heroRes, catBannerRes, contentRes, subsRes] = await Promise.all([
      db.from('products').select('*').order('sort_order', { ascending: true }),
      db.from('orders').select('*').order('created_at', { ascending: false }),
      db.from('profiles').select('*').order('created_at', { ascending: false }),
      db.from('user_roles').select('*'),
      db.from('product_categories').select('*').order('sort_order', { ascending: true }),
      db.from('hero_banners').select('*').order('sort_order', { ascending: true }),
      db.from('category_banners').select('*').order('category', { ascending: true }),
      db.from('site_content').select('*').order('sort_order', { ascending: true }),
      db.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
    ]);

    const firstError = [productsRes, ordersRes, profilesRes, rolesRes, categoriesRes, heroRes, catBannerRes, contentRes, subsRes].find((result) => result.error)?.error;
    if (firstError) toast.error(firstError.message);

    setProducts(productsRes.data ?? []);
    setOrders(ordersRes.data ?? []);
    setProfiles(profilesRes.data ?? []);
    setRoles(rolesRes.data ?? []);
    setProductCategories(categoriesRes.data ?? []);
    setHeroBanners(heroRes.data ?? []);
    setCategoryBanners(catBannerRes.data ?? []);
    setSiteContent(contentRes.data ?? []);
    setSubscribers(subsRes.data ?? []);
    setBusy(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setHasAdminAccess(false);
      setCheckingAdmin(false);
      return;
    }

    let cancelled = false;
    const checkAdmin = async () => {
      setCheckingAdmin(true);
      if (isAdminUser(user)) {
        if (!cancelled) {
          setHasAdminAccess(true);
          setCheckingAdmin(false);
        }
        return;
      }
      const { data } = await db.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      if (!cancelled) {
        setHasAdminAccess(!!data);
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
    return () => { cancelled = true; };
  }, [authLoading, user]);

  useEffect(() => {
    if (hasAdminAccess) loadAdminData();
  }, [hasAdminAccess]);

  const goTab = (tab: AdminTab) => navigate(tab === 'overview' ? '/admin' : `/admin/${tab}`);

  const uploadImage = async (file: File) => {
    if (!file) return null;
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `admin/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true, cacheControl: '3600' });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    toast.success('Image uploaded');
    return data.publicUrl;
  };

  const saveProduct = async () => {
    if (!productDraft) return;
    if (!productDraft.name.trim()) return toast.error('Product name is required');
    const id = productDraft.id.trim() || slugify(productDraft.name);
    if (!id) return toast.error('Product ID is required');
    if (reservedRoutes.has(id)) return toast.error('This product ID conflicts with a reserved route');
    const variants = productDraft.colorVariants
      .map((cv) => ({
        name: cv.name.trim(),
        hex: cv.hex.trim() || '#000000',
        sku: cv.sku?.trim() || undefined,
        stock: cv.stock ? Number(cv.stock) : undefined,
        images: cv.images.map((i) => i.trim()).filter(Boolean),
      }))
      .filter((cv) => cv.name && cv.images.length > 0);
    const price = Number(productDraft.price || 0);
    const originalPrice = productDraft.original_price ? Number(productDraft.original_price) : null;
    const stock = Number(productDraft.stock || 0);
    const data: any = {
      image: productDraft.image.trim(),
      images: splitList(productDraft.imagesText),
      sizes: splitList(productDraft.sizesText),
      colors: splitList(productDraft.colorsText),
      fabric: splitList(productDraft.fabricText),
      material: productDraft.material.trim() || undefined,
      fitType: productDraft.fitType.trim() || undefined,
      volumeOptions: splitList(productDraft.volumeOptionsText),
    };
    if (variants.length) data.colorVariants = variants;

    const payload = {
      id,
      name: productDraft.name.trim(),
      subtitle: productDraft.subtitle.trim() || null,
      category: productDraft.category,
      product_type: productDraft.product_type,
      brand: 'Delilar',
      sku: productDraft.sku.trim() || null,
      price,
      original_price: originalPrice,
      stock,
      description: productDraft.description.trim() || null,
      badge: productDraft.badge.trim() || null,
      in_stock: stock > 0,
      is_featured: productDraft.is_featured,
      is_new: productDraft.is_new,
      is_trending: productDraft.is_trending,
      is_sale: !!originalPrice && originalPrice > price,
      is_visible: productDraft.is_visible,
      tags: splitList(productDraft.tagsText),
      data,
      sort_order: Number(productDraft.sort_order || 0),
    };

    const { error } = await db.from('products').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Product saved');
    setProductDraft(null);
    loadAdminData();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Product deleted');
    loadAdminData();
  };

  const saveCategory = async () => {
    if (!categoryDraft) return;
    const id = categoryDraft.id.trim() || slugify(categoryDraft.name);
    if (!id || reservedRoutes.has(id)) return toast.error('Use a valid, non-reserved category slug');
    const { error } = await db.from('product_categories').upsert({
      id,
      name: categoryDraft.name.trim(),
      description: categoryDraft.description.trim() || null,
      image_url: categoryDraft.image_url.trim() || null,
      sort_order: Number(categoryDraft.sort_order || 0),
      enabled: categoryDraft.enabled,
    });
    if (error) return toast.error(error.message);
    toast.success('Category saved');
    setCategoryDraft(null);
    loadAdminData();
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category from admin categories? Products will not be deleted.')) return;
    const { error } = await db.from('product_categories').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Category deleted');
    loadAdminData();
  };

  const saveHeroBanner = async () => {
    if (!bannerDraft) return;
    if (!bannerDraft.title.trim() || !bannerDraft.image_url.trim()) return toast.error('Hero title and image are required');
    const payload: any = {
      title: bannerDraft.title.trim(),
      subtitle: bannerDraft.subtitle.trim() || null,
      eyebrow: bannerDraft.eyebrow.trim() || null,
      image_url: bannerDraft.image_url.trim(),
      mobile_image_url: bannerDraft.mobile_image_url.trim() || null,
      cta_label: bannerDraft.cta_label.trim() || null,
      cta_href: bannerDraft.cta_href.trim() || null,
      sort_order: Number(bannerDraft.sort_order || 0),
      enabled: bannerDraft.enabled,
    };
    if (bannerDraft.id) payload.id = bannerDraft.id;
    const { error } = await db.from('hero_banners').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Hero banner saved');
    setBannerDraft(null);
    loadAdminData();
  };

  const saveCategoryBanner = async () => {
    if (!categoryBannerDraft) return;
    if (!categoryBannerDraft.category || !categoryBannerDraft.image_url.trim()) return toast.error('Category and image are required');
    const payload: any = {
      category: categoryBannerDraft.category,
      title: categoryBannerDraft.title.trim() || null,
      subtitle: categoryBannerDraft.subtitle.trim() || null,
      image_url: categoryBannerDraft.image_url.trim(),
      enabled: categoryBannerDraft.enabled,
    };
    if (categoryBannerDraft.id) payload.id = categoryBannerDraft.id;
    const { error } = await db.from('category_banners').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Category banner saved');
    setCategoryBannerDraft(null);
    loadAdminData();
  };

  const saveContent = async () => {
    if (!contentDraft) return;
    if (!contentDraft.content_key.trim() || !contentDraft.title.trim()) return toast.error('Content key and title are required');
    const payload: any = {
      content_key: slugify(contentDraft.content_key),
      type: contentDraft.type.trim() || 'section',
      title: contentDraft.title.trim(),
      subtitle: contentDraft.subtitle.trim() || null,
      body: contentDraft.body.trim() || null,
      image_url: contentDraft.image_url.trim() || null,
      cta_label: contentDraft.cta_label.trim() || null,
      cta_href: contentDraft.cta_href.trim() || null,
      sort_order: Number(contentDraft.sort_order || 0),
      enabled: contentDraft.enabled,
      data: {},
    };
    if (contentDraft.id) payload.id = contentDraft.id;
    const { error } = await db.from('site_content').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Website content saved');
    setContentDraft(null);
    loadAdminData();
  };

  const updateOrder = async (id: string, patch: Record<string, any>) => {
    const { error } = await db.from('orders').update(patch).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Order updated');
    loadAdminData();
  };

  const saveTracking = async (order: OrderRow) => {
    const draft = trackingDrafts[order.id] ?? {};
    await updateOrder(order.id, {
      courier: draft.courier ?? order.courier ?? null,
      tracking_number: draft.tracking_number ?? order.tracking_number ?? null,
      tracking_url: draft.tracking_url ?? order.tracking_url ?? null,
      admin_notes: draft.admin_notes ?? order.admin_notes ?? null,
    });
  };

  const grantAdmin = async (profile: ProfileRow) => {
    const { error } = await db.from('user_roles').insert({ user_id: profile.id, role: 'admin' });
    if (error) return toast.error(error.message);
    toast.success(`${profile.email || profile.full_name || 'User'} is now an admin`);
    loadAdminData();
  };

  const revokeAdmin = async (profile: ProfileRow) => {
    if (profile.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return toast.error('Primary admin cannot be removed here');
    const { error } = await db.from('user_roles').delete().eq('user_id', profile.id).eq('role', 'admin');
    if (error) return toast.error(error.message);
    toast.success('Admin access removed');
    loadAdminData();
  };

  if (authLoading || checkingAdmin) {
    return (
      <AdminScreen>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-accent" size={34} />
        </div>
      </AdminScreen>
    );
  }

  if (!user) {
    return (
      <AdminScreen>
        <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:flex relative overflow-hidden bg-primary text-primary-foreground p-12 items-end">
            <div className="absolute inset-0 gradient-dark" />
            <div className="relative max-w-xl">
              <p className="text-xs tracking-[0.35em] uppercase text-accent font-body mb-4">Delilar Admin</p>
              <h1 className="font-heading text-5xl leading-tight mb-5">Premium Islamic fashion commerce control.</h1>
              <p className="text-primary-foreground/70 font-body leading-relaxed">
                Manage Jubba, Panjabi, T-Shirts, Polo Shirts, Pants, Perfumes, Attars, Bags, Accessories, orders, customers, and luxury brand content from one secure dashboard.
              </p>
            </div>
          </section>
          <section className="flex items-center justify-center px-6 py-16 bg-background">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-premium-lg">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
                <ShieldCheck className="text-accent" size={24} />
              </div>
              <p className="text-xs tracking-[0.3em] uppercase text-accent font-body mb-2">Secure Login</p>
              <h1 className="font-heading text-3xl mb-3">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground font-body mb-6">
                Sign in with the primary admin email <span className="text-foreground font-medium">{ADMIN_EMAIL}</span> or an account promoted by an existing admin.
              </p>
              <Button onClick={() => openAuthModal('Admin login required. Use the admin email/password account.')} className="w-full gap-2">
                <ShieldCheck size={16} /> Sign in to Admin
              </Button>
              <p className="text-xs text-muted-foreground font-body mt-5">
                No default password is stored in the codebase. Create or reset the admin password through the normal secure authentication flow.
              </p>
            </div>
          </section>
        </div>
      </AdminScreen>
    );
  }

  if (!hasAdminAccess) {
    return (
      <AdminScreen>
        <div className="min-h-screen flex items-center justify-center px-6 bg-background">
          <div className="max-w-md text-center rounded-2xl border border-destructive/30 bg-card p-8 shadow-premium">
            <ShieldCheck className="mx-auto text-destructive mb-4" size={34} />
            <h1 className="font-heading text-3xl mb-3">Access denied</h1>
            <p className="text-sm text-muted-foreground font-body mb-6">This account is not authorized to manage Delilar.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>Back to Store</Button>
              <Button onClick={async () => { await signOut(); openAuthModal('Sign in with an admin account.'); }}>Switch Account</Button>
            </div>
          </div>
        </div>
      </AdminScreen>
    );
  }

  return (
    <AdminScreen>
      <div className="min-h-screen bg-background text-foreground">
        <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 border-r border-border bg-card/95 backdrop-blur-xl lg:block">
          <div className="p-6 border-b border-border">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-primary text-accent flex items-center justify-center font-heading font-bold">D</span>
              <span>
                <span className="block font-heading text-xl tracking-[0.18em]">DELILAR</span>
                <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-body">Commerce Admin</span>
              </span>
            </Link>
          </div>
          <nav className="p-4 space-y-1">
            {adminTabs.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => goTab(item.key)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-body transition-all ${active ? 'bg-primary text-primary-foreground shadow-premium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                >
                  <span className="flex items-center gap-3"><Icon size={17} /> {item.label}</span>
                  {active && <ChevronRight size={15} className="text-accent" />}
                </button>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <p className="text-xs text-muted-foreground truncate mb-3">{user.email}</p>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={async () => { await signOut(); navigate('/'); toast.success('Signed out'); }}>
              <LogOut size={15} /> Logout
            </Button>
          </div>
        </aside>

        <main className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-accent font-body mb-1">Premium Islamic Fashion & Lifestyle</p>
                <h1 className="font-heading text-2xl sm:text-3xl">{adminTabs.find((tab) => tab.key === activeTab)?.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search admin data"
                    className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <Button variant="outline" onClick={loadAdminData} disabled={busy} className="gap-2">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} Refresh
                </Button>
              </div>
              <div className="lg:hidden grid grid-cols-3 gap-1 overflow-x-auto">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} onClick={() => goTab(tab.key)} className={`rounded-xl px-3 py-2 text-xs flex items-center justify-center gap-1 ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}>
                      <Icon size={13} /> {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' && (
              <OverviewPanel products={products} orders={orders} profiles={profiles} revenue={revenue} lowStock={lowStock} pendingOrders={pendingOrders} goTab={goTab} />
            )}

            {activeTab === 'products' && (
              <section className="space-y-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-2xl">Product Catalog</h2>
                    <p className="text-sm text-muted-foreground">Add, edit, delete, price, stock, variants, and image data for Delilar collections.</p>
                  </div>
                  <Button onClick={() => setProductDraft(emptyProductDraft(categoryOptions[0]?.id ?? 'jubba'))} className="gap-2"><Plus size={15} /> Add Product</Button>
                </div>

                {productDraft && (
                  <ProductEditor
                    draft={productDraft}
                    setDraft={setProductDraft}
                    categories={categoryOptions}
                    save={saveProduct}
                    uploading={uploading}
                    onUpload={async (file) => {
                      const url = await uploadImage(file);
                      if (url) setProductDraft((draft) => draft ? { ...draft, image: url, imagesText: [draft.imagesText, url].filter(Boolean).join('\n') } : draft);
                    }}
                  />
                )}

                <div className="grid gap-4">
                  {filteredProducts.map((product) => (
                    <AdminCard key={product.id} className="grid gap-4 lg:grid-cols-[88px_1fr_auto] lg:items-center">
                      <img src={resolveImage(product.data?.image)} alt={product.name} className="w-full h-28 lg:w-20 lg:h-20 rounded-xl object-cover bg-secondary" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-heading text-lg truncate">{product.name}</h3>
                          {product.is_featured && <Badge>Featured</Badge>}
                          {product.is_sale && <Badge variant="secondary">Sale</Badge>}
                          {!product.is_visible && <Badge variant="outline">Hidden</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-body">{product.id} · {product.category} · {product.product_type} · SKU {product.sku || '—'}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <Pill>{money(product.price)}</Pill>
                          <Pill>{product.stock} in stock</Pill>
                          <Pill>{product.data?.sizes?.length ?? 0} sizes</Pill>
                          <Pill>{product.data?.colorVariants?.length ?? product.data?.colors?.length ?? 0} color options</Pill>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button variant="outline" size="sm" onClick={() => setProductDraft(productToDraft(product))} className="gap-2"><PenLine size={14} /> Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)} className="gap-2 text-destructive hover:text-destructive"><Trash2 size={14} /> Delete</Button>
                      </div>
                    </AdminCard>
                  ))}
                </div>

                <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                  <AdminCard>
                    <PanelTitle icon={Boxes} title="Product Categories" subtitle="Control storefront category structure without conflicting with reserved routes." />
                    <div className="mt-5 space-y-3">
                      {categoryOptions.map((cat) => {
                        const dbCat = productCategories.find((item) => item.id === cat.id);
                        return (
                          <div key={cat.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                            <div>
                              <p className="font-medium text-sm">{cat.name}</p>
                              <p className="text-xs text-muted-foreground">/{cat.id} · {cat.description || 'No description'}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setCategoryDraft(categoryToDraft(dbCat ?? { id: cat.id, name: cat.name, description: cat.description, sort_order: 0, enabled: true }))}>Edit</Button>
                              {dbCat && <Button variant="outline" size="sm" onClick={() => deleteCategory(cat.id)} className="text-destructive hover:text-destructive">Delete</Button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AdminCard>

                  <AdminCard>
                    <PanelTitle icon={Plus} title="Add Category" subtitle="Supports Jubba, Panjabi, T-Shirts, Polo Shirts, Pants, Perfumes, Attars, Bags, accessories, and future lifestyle lines." />
                    <Button className="mt-5 w-full" onClick={() => setCategoryDraft(categoryToDraft())}>Create Category</Button>
                    {categoryDraft && <CategoryEditor draft={categoryDraft} setDraft={setCategoryDraft} save={saveCategory} />}
                  </AdminCard>
                </div>
              </section>
            )}

            {activeTab === 'orders' && (
              <OrdersPanel orders={orders} profileById={profileById} trackingDrafts={trackingDrafts} setTrackingDrafts={setTrackingDrafts} updateOrder={updateOrder} saveTracking={saveTracking} />
            )}

            {activeTab === 'customers' && (
              <CustomersPanel
                customers={filteredCustomers}
                orders={orders}
                adminRoleIds={adminRoleIds}
                selectedCustomer={selectedCustomer}
                selectedCustomerOrders={selectedCustomerOrders}
                selectCustomer={setSelectedCustomerId}
                grantAdmin={grantAdmin}
                revokeAdmin={revokeAdmin}
              />
            )}

            {activeTab === 'content' && (
              <ContentPanel
                heroBanners={heroBanners}
                categoryBanners={categoryBanners}
                siteContent={siteContent}
                categoryOptions={categoryOptions}
                bannerDraft={bannerDraft}
                setBannerDraft={setBannerDraft}
                saveHeroBanner={saveHeroBanner}
                categoryBannerDraft={categoryBannerDraft}
                setCategoryBannerDraft={setCategoryBannerDraft}
                saveCategoryBanner={saveCategoryBanner}
                contentDraft={contentDraft}
                setContentDraft={setContentDraft}
                saveContent={saveContent}
              />
            )}

            {activeTab === 'subscribers' && (
              <SubscribersPanel subscribers={subscribers} />
            )}

            {activeTab === 'inventory' && (
              <InventoryPanel products={products} />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel userEmail={user.email ?? ''} signOut={signOut} navigateHome={() => navigate('/')} customerCount={profiles.length} adminCount={adminRoleIds.size + (adminRoleIds.has(user.id) || isAdminUser(user) ? 0 : 1)} />
            )}
          </div>
        </main>
      </div>
    </AdminScreen>
  );
};

const adminTabs: { key: AdminTab; label: string; title: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', title: 'Dashboard Overview', icon: LayoutDashboard },
  { key: 'products', label: 'Products', title: 'Products & Categories', icon: Package },
  { key: 'inventory', label: 'Inventory', title: 'Inventory & Stock', icon: Boxes },
  { key: 'orders', label: 'Orders', title: 'Orders & Delivery', icon: ShoppingBag },
  { key: 'customers', label: 'Customers', title: 'Customers & Purchase History', icon: Users },
  { key: 'subscribers', label: 'Subscribers', title: 'Newsletter Subscribers', icon: Mail },
  { key: 'content', label: 'Content', title: 'Website Content', icon: ImageIcon },
  { key: 'settings', label: 'Settings', title: 'Authentication & Settings', icon: Settings },
];

const SubscribersPanel = ({ subscribers }: { subscribers: { id: string; email: string; source: string; created_at: string }[] }) => {
  const exportCsv = () => {
    const rows = [['Email', 'Source', 'Date'], ...subscribers.map((s) => [s.email, s.source, new Date(s.created_at).toISOString()])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delilar-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Newsletter Subscribers</h2>
          <p className="text-sm text-muted-foreground">Emails collected from the “Join the Delilar Family” footer signup.</p>
        </div>
        <Button onClick={exportCsv} disabled={!subscribers.length} className="gap-2"><Mail size={15} /> Export CSV</Button>
      </div>
      <AdminCard>
        {subscribers.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No subscribers yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {subscribers.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <span className="font-medium">{s.email}</span>
                <span className="text-xs text-muted-foreground">{s.source} · {new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </section>
  );
};

const InventoryPanel = ({ products }: { products: ProductRow[] }) => {
  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock < 3);
  const healthy = products.filter((p) => p.stock >= 3);
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl">Inventory Management</h2>
        <p className="text-sm text-muted-foreground">Total, sold, and remaining stock per product. Customers never see these numbers.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Metric icon={Package} label="Total Products" value={products.length} detail="All catalog items" />
        <Metric icon={Boxes} label="Low Stock" value={lowStock.length} detail="Less than 3 remaining" />
        <Metric icon={ShieldCheck} label="Out of Stock" value={outOfStock.length} detail="Hidden CTA on storefront" />
      </div>
      <AdminCard>
        <PanelTitle icon={Boxes} title="Stock Ledger" subtitle="Total stock = Sold + Remaining. Edit per-product values in the Products tab." />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                <th className="py-3 pr-3">Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Remaining</th>
                <th className="py-3 px-3 text-right">Sold</th>
                <th className="py-3 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...outOfStock, ...lowStock, ...healthy].map((p) => {
                const sold = (p as any).sold_count ?? 0;
                const status = p.stock <= 0 ? 'Out of stock' : p.stock < 3 ? 'Low' : 'Healthy';
                const tone = p.stock <= 0 ? 'text-destructive' : p.stock < 3 ? 'text-amber-600' : 'text-green-700';
                return (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-3 pr-3 font-medium">{p.name}</td>
                    <td className="py-3 px-3 text-muted-foreground capitalize">{p.category}</td>
                    <td className="py-3 px-3 text-right">{p.stock}</td>
                    <td className="py-3 px-3 text-right">{sold}</td>
                    <td className={`py-3 pl-3 text-right font-semibold ${tone}`}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </section>
  );
};

const AdminScreen = ({ children }: { children: React.ReactNode }) => <div className="font-body bg-background min-h-screen">{children}</div>;
const AdminCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`rounded-2xl border border-border bg-card p-5 shadow-premium ${className}`}>{children}</div>;
const Pill = ({ children }: { children: React.ReactNode }) => <span className="rounded-full border border-border bg-secondary px-3 py-1 text-muted-foreground">{children}</span>;
const TogglePill = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs transition-all ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}>{label}</button>
);
const PanelTitle = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <div className="flex gap-3">
    <span className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center shrink-0"><Icon size={18} /></span>
    <div>
      <h3 className="font-heading text-xl">{title}</h3>
      <p className="text-sm text-muted-foreground font-body">{subtitle}</p>
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text', placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; rows?: number }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body">{label}</span>
    {rows ? (
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
    ) : (
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
    )}
  </label>
);

const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

const ProductEditor = ({ draft, setDraft, categories, save, uploading, onUpload }: { draft: ProductDraft; setDraft: (draft: ProductDraft | null | ((draft: ProductDraft | null) => ProductDraft | null)) => void; categories: { id: string; name: string }[]; save: () => void; uploading: boolean; onUpload: (file: File) => void }) => (
  <AdminCard>
    <div className="flex items-start justify-between gap-4 mb-5">
      <PanelTitle icon={PenLine} title={draft.id ? 'Edit Product' : 'Add Product'} subtitle="Manage pricing, stock, variants, images, badges, and category placement." />
      <Button variant="ghost" size="icon" onClick={() => setDraft(null)}><X size={18} /></Button>
    </div>
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Field label="Product ID / Slug" value={draft.id} onChange={(v) => setDraft({ ...draft, id: slugify(v) })} placeholder="auto-created from name" />
      <Field label="Product Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, id: draft.id || slugify(v) })} />
      <Field label="Subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} />
      <SelectField label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={categories.map((cat) => ({ value: cat.id, label: cat.name }))} />
      <SelectField label="Product Type" value={draft.product_type} onChange={(v) => setDraft({ ...draft, product_type: v as ProductType })} options={productTypes.map((type) => ({ value: type, label: type }))} />
      <Field label="SKU" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} />
      <Field label="Price" type="number" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
      <Field label="Sale / Original Price" type="number" value={draft.original_price} onChange={(v) => setDraft({ ...draft, original_price: v })} />
      <Field label="Stock" type="number" value={draft.stock} onChange={(v) => setDraft({ ...draft, stock: v })} />
      <Field label="Badge" value={draft.badge} onChange={(v) => setDraft({ ...draft, badge: v })} placeholder="Best Seller, Premium, New" />
      <Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
      <Field label="Tags" value={draft.tagsText} onChange={(v) => setDraft({ ...draft, tagsText: v })} placeholder="jubba, eid, premium" />
    </div>
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <Field label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={5} />
      <div className="space-y-4">
        <Field label="Primary Image URL" value={draft.image} onChange={(v) => setDraft({ ...draft, image: v })} />
        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-4 text-sm text-muted-foreground cursor-pointer hover:border-accent hover:text-foreground transition-all">
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload product image
          <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} />
        </label>
        <Field label="Gallery Image URLs" value={draft.imagesText} onChange={(v) => setDraft({ ...draft, imagesText: v })} rows={4} placeholder="One image URL per line" />
      </div>
    </div>
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
      <Field label="Sizes" value={draft.sizesText} onChange={(v) => setDraft({ ...draft, sizesText: v })} />
      <Field label="Colors" value={draft.colorsText} onChange={(v) => setDraft({ ...draft, colorsText: v })} />
      <Field label="Fabric" value={draft.fabricText} onChange={(v) => setDraft({ ...draft, fabricText: v })} />
      <Field label="Fit Type" value={draft.fitType} onChange={(v) => setDraft({ ...draft, fitType: v })} />
      <Field label="Material" value={draft.material} onChange={(v) => setDraft({ ...draft, material: v })} />
      <Field label="Volume Options" value={draft.volumeOptionsText} onChange={(v) => setDraft({ ...draft, volumeOptionsText: v })} placeholder="3ml, 6ml, 50ml" />
    </div>
    <ColorVariantsEditor
      variants={draft.colorVariants}
      setVariants={(next) => setDraft({ ...draft, colorVariants: next })}
      uploadFn={uploadFn}
    />
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <TogglePill active={draft.is_visible} label="Visible" onClick={() => setDraft({ ...draft, is_visible: !draft.is_visible })} />
        <TogglePill active={draft.is_featured} label="Featured" onClick={() => setDraft({ ...draft, is_featured: !draft.is_featured })} />
        <TogglePill active={draft.is_new} label="New" onClick={() => setDraft({ ...draft, is_new: !draft.is_new })} />
        <TogglePill active={draft.is_trending} label="Trending" onClick={() => setDraft({ ...draft, is_trending: !draft.is_trending })} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
        <Button onClick={save}>Save Product</Button>
      </div>
    </div>
  </AdminCard>
);

const CategoryEditor = ({ draft, setDraft, save }: { draft: CategoryDraft; setDraft: (draft: CategoryDraft | null) => void; save: () => void }) => (
  <div className="mt-5 space-y-3">
    <Field label="Slug" value={draft.id} onChange={(v) => setDraft({ ...draft, id: slugify(v) })} />
    <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, id: draft.id || slugify(v) })} />
    <Field label="Description" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={3} />
    <Field label="Image URL" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} />
    <Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
    <TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} />
    <div className="flex gap-2"><Button onClick={save}>Save Category</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div>
  </div>
);

const OverviewPanel = ({ products, orders, profiles, revenue, lowStock, pendingOrders, goTab }: any) => (
  <section className="space-y-8">
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Metric icon={Package} label="Products" value={products.length} detail={`${lowStock} low stock`} />
      <Metric icon={ShoppingBag} label="Orders" value={orders.length} detail={`${pendingOrders} active deliveries`} />
      <Metric icon={Users} label="Customers" value={profiles.length} detail="Registered profiles" />
      <Metric icon={BarChart3} label="Revenue" value={money(revenue)} detail="Excludes cancelled/refunded" />
    </div>
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
      <AdminCard>
        <PanelTitle icon={Sparkles} title="Delilar Control Center" subtitle="A premium admin system for Islamic fashion, fragrance, accessories, orders, and content." />
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          {[{ tab: 'products', label: 'Manage Products', text: 'Create products, variants, stock, sale pricing, and images.' }, { tab: 'orders', label: 'Process Orders', text: 'Update status, tracking, cancellation, and refunds.' }, { tab: 'customers', label: 'View Customers', text: 'Profiles, purchase history, and admin promotion.' }, { tab: 'content', label: 'Edit Website', text: 'Hero banners, collections, footer, policies, and pages.' }].map((item) => (
            <button key={item.tab} onClick={() => goTab(item.tab)} className="text-left rounded-2xl border border-border bg-background p-5 hover:border-accent transition-all">
              <h3 className="font-heading text-lg mb-1">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </button>
          ))}
        </div>
      </AdminCard>
      <AdminCard>
        <PanelTitle icon={Truck} title="Operations Queue" subtitle="Active ecommerce priorities." />
        <div className="mt-6 space-y-3">
          <Queue label="Orders to fulfill" value={pendingOrders} />
          <Queue label="Low stock products" value={lowStock} />
          <Queue label="Hidden products" value={products.filter((p: ProductRow) => !p.is_visible).length} />
          <Queue label="Featured products" value={products.filter((p: ProductRow) => p.is_featured).length} />
        </div>
      </AdminCard>
    </div>
  </section>
);

const Metric = ({ icon: Icon, label, value, detail }: any) => <AdminCard><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p><p className="font-heading text-3xl mt-2">{value}</p><p className="text-xs text-muted-foreground mt-1">{detail}</p></div><span className="w-11 h-11 rounded-xl bg-primary text-accent flex items-center justify-center"><Icon size={19} /></span></div></AdminCard>;
const Queue = ({ label, value }: { label: string; value: number }) => <div className="flex items-center justify-between rounded-xl bg-background border border-border px-4 py-3"><span className="text-sm text-muted-foreground">{label}</span><span className="font-heading text-xl">{value}</span></div>;

const OrdersPanel = ({ orders, profileById, trackingDrafts, setTrackingDrafts, updateOrder, saveTracking }: any) => (
  <section className="space-y-5">
    <div><h2 className="font-heading text-2xl">Orders</h2><p className="text-sm text-muted-foreground">View order details, customer shipping information, delivery tracking, cancellations, and refunds.</p></div>
    {orders.length === 0 && <AdminCard><p className="text-center text-muted-foreground py-10">No orders yet.</p></AdminCard>}
    {orders.map((order: OrderRow) => {
      const customer = profileById.get(order.user_id);
      const draft = trackingDrafts[order.id] ?? order;
      return (
        <AdminCard key={order.id} className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2"><h3 className="font-heading text-xl">Order #{shortId(order.id)}</h3><Badge variant="secondary">{order.status}</Badge></div>
              <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()} · {customer?.full_name || customer?.email || 'Customer'} · {money(order.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">Payment: {order.payment_method} · Items: {order.items?.length ?? 0}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={order.status} onChange={(event) => updateOrder(order.id, { status: event.target.value })} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <Button variant="outline" onClick={() => updateOrder(order.id, { status: 'cancelled', cancelled_at: new Date().toISOString() })}>Cancel</Button>
              <Button variant="outline" onClick={() => updateOrder(order.id, { status: 'refunded', refunded_at: new Date().toISOString() })}>Refund</Button>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Customer</p>
              <p className="font-medium">{customer?.full_name || 'No profile name'}</p>
              <p className="text-sm text-muted-foreground">{customer?.email || 'No email'}</p>
              <p className="text-sm text-muted-foreground">{customer?.phone || 'No phone'}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Shipping</p>
              <p className="text-sm text-muted-foreground">{order.shipping_address ? JSON.stringify(order.shipping_address) : [customer?.house_number, customer?.village, customer?.upazila, customer?.district].filter(Boolean).join(', ') || 'No shipping address'}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Items</p>
              <div className="space-y-1 text-sm text-muted-foreground max-h-24 overflow-auto">{(order.items ?? []).map((item, index) => <p key={index}>{item.name || item.product?.name || 'Item'} × {item.quantity || 1}</p>)}</div>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <Field label="Courier" value={String(draft.courier ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], courier: v } }))} />
            <Field label="Tracking Number" value={String(draft.tracking_number ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], tracking_number: v } }))} />
            <Field label="Tracking URL" value={String(draft.tracking_url ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], tracking_url: v } }))} />
            <div className="flex items-end"><Button className="w-full" onClick={() => saveTracking(order)}>Save Tracking</Button></div>
          </div>
          <Field label="Admin Notes" value={String(draft.admin_notes ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], admin_notes: v } }))} rows={2} />
        </AdminCard>
      );
    })}
  </section>
);

const CustomersPanel = ({ customers, orders, adminRoleIds, selectedCustomer, selectedCustomerOrders, selectCustomer, grantAdmin, revokeAdmin }: any) => (
  <section className="grid xl:grid-cols-[1fr_420px] gap-6">
    <div className="space-y-4">
      <div><h2 className="font-heading text-2xl">Customers</h2><p className="text-sm text-muted-foreground">Customer profiles, contact details, purchase history, and admin management.</p></div>
      {customers.map((customer: ProfileRow) => (
        <AdminCard key={customer.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button onClick={() => selectCustomer(customer.id)} className="text-left">
            <p className="font-heading text-lg">{customer.full_name || 'Unnamed Customer'} {adminRoleIds.has(customer.id) && <Badge className="ml-2">Admin</Badge>}</p>
            <p className="text-sm text-muted-foreground">{customer.email || 'No email'} · {customer.phone || 'No phone'}</p>
            <p className="text-xs text-muted-foreground mt-1">{orders.filter((order: OrderRow) => order.user_id === customer.id).length} orders · {customer.district || customer.city || 'No location'}</p>
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => selectCustomer(customer.id)}>Details</Button>
            {adminRoleIds.has(customer.id) ? <Button variant="outline" size="sm" onClick={() => revokeAdmin(customer)}>Remove Admin</Button> : <Button size="sm" onClick={() => grantAdmin(customer)}>Make Admin</Button>}
          </div>
        </AdminCard>
      ))}
    </div>
    <AdminCard className="xl:sticky xl:top-28 xl:self-start">
      {selectedCustomer ? <><PanelTitle icon={UserCog} title={selectedCustomer.full_name || 'Customer Profile'} subtitle={selectedCustomer.email || selectedCustomer.id} /><div className="mt-5 space-y-3 text-sm"><InfoRow label="Phone" value={selectedCustomer.phone || '—'} /><InfoRow label="Address" value={[selectedCustomer.house_number, selectedCustomer.village, selectedCustomer.upazila, selectedCustomer.district].filter(Boolean).join(', ') || selectedCustomer.address || '—'} /><InfoRow label="Orders" value={String(selectedCustomerOrders.length)} /><InfoRow label="Total Spend" value={money(selectedCustomerOrders.reduce((sum: number, order: OrderRow) => sum + Number(order.total || 0), 0))} /></div><div className="mt-5 space-y-2"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Purchase History</p>{selectedCustomerOrders.map((order: OrderRow) => <div key={order.id} className="rounded-xl border border-border bg-background p-3 text-sm"><p className="font-medium">#{shortId(order.id)} · {money(order.total)}</p><p className="text-muted-foreground">{order.status} · {new Date(order.created_at).toLocaleDateString()}</p></div>)}</div></> : <p className="text-sm text-muted-foreground">Select a customer to view profile and purchase history.</p>}
    </AdminCard>
  </section>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => <div className="flex justify-between gap-4 border-b border-border pb-2"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;

const ContentPanel = ({ heroBanners, categoryBanners, siteContent, categoryOptions, bannerDraft, setBannerDraft, saveHeroBanner, categoryBannerDraft, setCategoryBannerDraft, saveCategoryBanner, contentDraft, setContentDraft, saveContent }: any) => (
  <section className="space-y-8">
    <div><h2 className="font-heading text-2xl">Website Content</h2><p className="text-sm text-muted-foreground">Manage homepage banners, hero sections, collections, footer content, policies, About page, and contact information.</p></div>
    <div className="grid xl:grid-cols-2 gap-6">
      <AdminCard><PanelTitle icon={ImageIcon} title="Hero Sections" subtitle="Homepage hero slides and campaign banners." /><Button className="mt-5" onClick={() => setBannerDraft(bannerToDraft())}><Plus size={15} /> Add Hero</Button><div className="mt-5 space-y-3">{heroBanners.map((banner: HeroBannerRow) => <ContentListItem key={banner.id} title={banner.title} subtitle={banner.subtitle || banner.cta_href || 'Hero banner'} enabled={banner.enabled} onEdit={() => setBannerDraft(bannerToDraft(banner))} />)}</div>{bannerDraft && <HeroBannerEditor draft={bannerDraft} setDraft={setBannerDraft} save={saveHeroBanner} />}</AdminCard>
      <AdminCard><PanelTitle icon={Boxes} title="Collection Banners" subtitle="Category page banner identity for fashion and lifestyle lines." /><Button className="mt-5" onClick={() => setCategoryBannerDraft(categoryBannerToDraft())}><Plus size={15} /> Add Category Banner</Button><div className="mt-5 space-y-3">{categoryBanners.map((banner: CategoryBannerRow) => <ContentListItem key={banner.id} title={banner.category} subtitle={banner.title || banner.subtitle || 'Category banner'} enabled={banner.enabled} onEdit={() => setCategoryBannerDraft(categoryBannerToDraft(banner))} />)}</div>{categoryBannerDraft && <CategoryBannerEditor draft={categoryBannerDraft} setDraft={setCategoryBannerDraft} save={saveCategoryBanner} categories={categoryOptions} />}</AdminCard>
    </div>
    <AdminCard><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><PanelTitle icon={FileText} title="Pages, Footer & Policies" subtitle="Edit About, contact info, footer copy, shipping, return, and privacy content." /><Button onClick={() => setContentDraft(contentToDraft())}><Plus size={15} /> Add Content</Button></div><div className="mt-5 grid md:grid-cols-2 gap-3">{siteContent.map((content: ContentRow) => <ContentListItem key={content.id} title={content.title} subtitle={`${content.type} · ${content.content_key}`} enabled={content.enabled} onEdit={() => setContentDraft(contentToDraft(content))} />)}</div>{contentDraft && <SiteContentEditor draft={contentDraft} setDraft={setContentDraft} save={saveContent} />}</AdminCard>
  </section>
);

const ContentListItem = ({ title, subtitle, enabled, onEdit }: any) => <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"><div><p className="font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground">{subtitle}</p></div><div className="flex items-center gap-2"><Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Live' : 'Hidden'}</Badge><Button variant="outline" size="sm" onClick={onEdit}>Edit</Button></div></div>;

const HeroBannerEditor = ({ draft, setDraft, save }: any) => <div className="mt-5 grid gap-3"><Field label="Eyebrow" value={draft.eyebrow} onChange={(v) => setDraft({ ...draft, eyebrow: v })} /><Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} rows={3} /><Field label="Desktop Image URL" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><Field label="Mobile Image URL" value={draft.mobile_image_url} onChange={(v) => setDraft({ ...draft, mobile_image_url: v })} /><Field label="CTA Label" value={draft.cta_label} onChange={(v) => setDraft({ ...draft, cta_label: v })} /><Field label="CTA Link" value={draft.cta_href} onChange={(v) => setDraft({ ...draft, cta_href: v })} /><Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} /><div className="flex gap-2"><Button onClick={save}>Save Hero</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></div>;
const CategoryBannerEditor = ({ draft, setDraft, save, categories }: any) => <div className="mt-5 grid gap-3"><SelectField label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} options={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))} /><Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} /><Field label="Image URL" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} /><div className="flex gap-2"><Button onClick={save}>Save Banner</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></div>;
const SiteContentEditor = ({ draft, setDraft, save }: any) => <div className="mt-5 grid md:grid-cols-2 gap-3"><Field label="Content Key" value={draft.content_key} onChange={(v) => setDraft({ ...draft, content_key: v })} /><Field label="Type" value={draft.type} onChange={(v) => setDraft({ ...draft, type: v })} placeholder="page, footer, policy, section" /><Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} /><Field label="Image URL" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} /><Field label="CTA Link" value={draft.cta_href} onChange={(v) => setDraft({ ...draft, cta_href: v })} /><div className="md:col-span-2"><Field label="Body" value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} rows={5} /></div><Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} /><div className="flex items-end gap-2"><TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} /><Button onClick={save}>Save Content</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></div>;

const SettingsPanel = ({ userEmail, signOut, navigateHome, customerCount, adminCount }: any) => {
  const [newEmail, setNewEmail] = useState(userEmail || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const updateEmail = async () => {
    if (!newEmail || newEmail === userEmail) return toast.error('Enter a different email');
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);
    if (error) return toast.error(error.message);
    toast.success('Confirmation sent', { description: `Check ${newEmail} to confirm the change.` });
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast.error(error.message);
    setNewPassword(''); setConfirmPassword('');
    toast.success('Password updated');
  };

  return (
    <section className="grid xl:grid-cols-[1fr_0.9fr] gap-6">
      <AdminCard>
        <PanelTitle icon={ShieldCheck} title="Change Admin Email" subtitle="Update the email used to sign in to the admin dashboard. A confirmation link will be sent to the new address." />
        <div className="mt-6 space-y-3">
          <Field label="New Admin Email" value={newEmail} onChange={setNewEmail} placeholder="admin@example.com" />
          <Button onClick={updateEmail} disabled={savingEmail} className="gap-2">
            {savingEmail && <Loader2 size={14} className="animate-spin" />} Update Email
          </Button>
        </div>
        <div className="mt-8 border-t border-border pt-6">
          <PanelTitle icon={Lock} title="Change Password" subtitle="Set a new password for this admin account." />
          <div className="mt-6 space-y-3">
            <Field label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
            <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
            <Button onClick={updatePassword} disabled={savingPassword} className="gap-2">
              {savingPassword && <Loader2 size={14} className="animate-spin" />} Update Password
            </Button>
          </div>
        </div>
      </AdminCard>
      <AdminCard>
        <PanelTitle icon={Settings} title="Session" subtitle="Current signed-in admin and operating summary." />
        <div className="mt-6 space-y-3">
          <InfoRow label="Signed in as" value={userEmail} />
          <InfoRow label="Customers" value={String(customerCount)} />
          <InfoRow label="Admins" value={String(adminCount)} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={navigateHome}>View Storefront</Button>
          <Button onClick={async () => { await signOut(); navigateHome(); toast.success('Signed out'); }} className="gap-2">
            <LogOut size={15} /> Logout
          </Button>
        </div>
        <div className="mt-6 rounded-xl border border-border bg-background p-4 text-xs text-muted-foreground space-y-1">
          <p className="text-foreground font-medium">Forgot password flow</p>
          <p>Customers and admins can use “Forgot password?” on the sign-in modal. A secure reset link is emailed and lands on <code>/reset-password</code>.</p>
        </div>
      </AdminCard>
    </section>
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => <div className="rounded-xl border border-border bg-background p-4"><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1">{label}</p><p className="text-foreground">{value}</p></div>;

export default Admin;
