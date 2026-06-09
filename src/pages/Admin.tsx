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
  MapPin,
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
  Download,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_EMAIL, isAdminUser } from '@/lib/admin';
import { categories as staticCategories } from '@/data/products';
import { resolveImage } from '@/lib/imageAssets';
import { defaultInfoSections, mergeInfoSections } from '@/lib/productInfoDefaults';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type AdminTab = 'overview' | 'products' | 'orders' | 'payments' | 'customers' | 'subscribers' | 'inventory' | 'outlets' | 'content' | 'admins' | 'settings';
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
  fabricInfo: string;
  careInfo: string;
  shippingInfo: string;
  returnsInfo: string;
  faqsInfo: string;
  is_featured: boolean;
  is_new: boolean;
  is_trending: boolean;
  is_visible: boolean;
  new_until: string; // ISO date (yyyy-mm-dd) — optional override to extend New Arrival window
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
  payment_status?: string;
  txn_id?: string | null;
  payer_number?: string | null;
  screenshot_url?: string | null;
  payment_account?: string | null;
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
  username?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  department?: string | null;
  notes?: string | null;
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
  page?: string | null;
  position?: number | null;
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
type CategoryBannerDraft = { id?: string; page: string; position: number; category: string; title: string; subtitle: string; image_url: string; enabled: boolean };
type ContentDraft = { id?: string; content_key: string; type: string; title: string; subtitle: string; body: string; image_url: string; cta_label: string; cta_href: string; sort_order: string; enabled: boolean };

type OutletRow = {
  id: string;
  name: string;
  address: string;
  city?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  hours?: string | null;
  email?: string | null;
  map_embed_url?: string | null;
  map_link?: string | null;
  image_url?: string | null;
  enabled: boolean;
  is_primary: boolean;
  sort_order: number;
};
type OutletDraft = {
  id?: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  hours: string;
  email: string;
  map_embed_url: string;
  map_link: string;
  image_url: string;
  enabled: boolean;
  is_primary: boolean;
  sort_order: string;
};

const outletToDraft = (outlet?: OutletRow): OutletDraft => ({
  id: outlet?.id,
  name: outlet?.name ?? '',
  address: outlet?.address ?? '',
  city: outlet?.city ?? '',
  phone: outlet?.phone ?? '',
  whatsapp: outlet?.whatsapp ?? '',
  hours: outlet?.hours ?? '',
  email: outlet?.email ?? '',
  map_embed_url: outlet?.map_embed_url ?? '',
  map_link: outlet?.map_link ?? '',
  image_url: outlet?.image_url ?? '',
  enabled: outlet?.enabled ?? true,
  is_primary: outlet?.is_primary ?? false,
  sort_order: String(outlet?.sort_order ?? 0),
});

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
  sizesText: 'XS, S, M, L, XL, XXL, XXXL',
  colorsText: '',
  colorVariants: [],
  fabricText: '',
  material: '',
  fitType: '',
  volumeOptionsText: '',
  fabricInfo: defaultInfoSections().fabric,
  careInfo: defaultInfoSections().care,
  shippingInfo: defaultInfoSections().shipping,
  returnsInfo: defaultInfoSections().returns,
  faqsInfo: defaultInfoSections().faqs,
  is_featured: false,
  is_new: false,
  is_trending: false,
  is_visible: true,
  new_until: '',
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
  ...(() => {
    const info = mergeInfoSections(product.data?.infoSections);
    return {
      fabricInfo: info.fabric,
      careInfo: info.care,
      shippingInfo: info.shipping,
      returnsInfo: info.returns,
      faqsInfo: info.faqs,
    };
  })(),
  is_featured: !!product.is_featured,
  is_new: !!product.is_new,
  is_trending: !!product.is_trending,
  is_visible: !!product.is_visible,
  new_until: product.data?.newUntil ? String(product.data.newUntil).slice(0, 10) : '',
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
  page: banner?.page ?? banner?.category ?? 'home',
  position: (banner?.position as number) ?? 1,
  category: banner?.category ?? banner?.page ?? 'home',
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
  const activeTab: AdminTab = segment && ['overview', 'products', 'orders', 'payments', 'customers', 'subscribers', 'inventory', 'outlets', 'content', 'admins', 'settings'].includes(segment) ? segment : 'overview';

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
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [outletDraft, setOutletDraft] = useState<OutletDraft | null>(null);
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
  const adminRoleIds = useMemo(() => new Set(roles.filter((role) => ['admin', 'super_admin', 'manager', 'editor'].includes(role.role)).map((role) => role.user_id)), [roles]);
  const roleByUser = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((r) => {
      if (['admin', 'super_admin', 'manager', 'editor'].includes(r.role)) map.set(r.user_id, r.role);
    });
    return map;
  }, [roles]);
  const isSuperAdmin = isAdminUser(user) || roleByUser.get(user?.id ?? '') === 'super_admin';

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
    const [productsRes, ordersRes, profilesRes, rolesRes, categoriesRes, heroRes, catBannerRes, contentRes, subsRes, outletsRes] = await Promise.all([
      db.from('products').select('*').order('sort_order', { ascending: true }),
      db.from('orders').select('*').order('created_at', { ascending: false }),
      db.from('profiles').select('*').order('created_at', { ascending: false }),
      db.from('user_roles').select('*'),
      db.from('product_categories').select('*').order('sort_order', { ascending: true }),
      db.from('hero_banners').select('*').order('sort_order', { ascending: true }),
      db.from('category_banners').select('*').order('category', { ascending: true }),
      db.from('site_content').select('*').order('sort_order', { ascending: true }),
      db.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
      db.from('outlets').select('*').order('sort_order', { ascending: true }),
    ]);

    const firstError = [productsRes, ordersRes, profilesRes, rolesRes, categoriesRes, heroRes, catBannerRes, contentRes, subsRes, outletsRes].find((result) => result.error)?.error;
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
    setOutlets(outletsRes.data ?? []);
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
      infoSections: {
        fabric: productDraft.fabricInfo.trim() || defaultInfoSections().fabric,
        care: productDraft.careInfo.trim() || defaultInfoSections().care,
        shipping: productDraft.shippingInfo.trim() || defaultInfoSections().shipping,
        returns: productDraft.returnsInfo.trim() || defaultInfoSections().returns,
        faqs: productDraft.faqsInfo.trim() || defaultInfoSections().faqs,
      },
    };
    if (variants.length) data.colorVariants = variants;
    if (productDraft.new_until) data.newUntil = productDraft.new_until;

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
    const page = (categoryBannerDraft.page || categoryBannerDraft.category || '').trim();
    if (!page || !categoryBannerDraft.image_url.trim()) return toast.error('Page and image are required');
    const position = categoryBannerDraft.position === 2 ? 2 : 1;
    // Enforce max 2 banners per page
    const samePageBanners = categoryBanners.filter((b) => (b.page ?? b.category) === page && b.id !== categoryBannerDraft.id);
    if (samePageBanners.length >= 2 && !categoryBannerDraft.id) {
      return toast.error('Only 2 banners allowed per page');
    }
    const conflict = samePageBanners.find((b) => (b.position ?? 1) === position);
    if (conflict) return toast.error(`Position ${position} on this page is already used. Edit or delete it first.`);
    const payload: any = {
      page,
      position,
      category: page,
      title: categoryBannerDraft.title.trim() || null,
      subtitle: categoryBannerDraft.subtitle.trim() || null,
      image_url: categoryBannerDraft.image_url.trim(),
      enabled: categoryBannerDraft.enabled,
    };
    if (categoryBannerDraft.id) payload.id = categoryBannerDraft.id;
    const { error } = await db.from('category_banners').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Collection banner saved');
    setCategoryBannerDraft(null);
    loadAdminData();
  };

  const deleteCategoryBanner = async (id: string) => {
    if (!confirm('Delete this collection banner?')) return;
    const { error } = await db.from('category_banners').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Banner deleted');
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

  const saveOutlet = async () => {
    if (!outletDraft) return;
    if (!outletDraft.name.trim() || !outletDraft.address.trim()) return toast.error('Outlet name and address are required');
    const payload: any = {
      name: outletDraft.name.trim(),
      address: outletDraft.address.trim(),
      city: outletDraft.city.trim() || null,
      phone: outletDraft.phone.trim() || null,
      whatsapp: outletDraft.whatsapp.trim() || null,
      hours: outletDraft.hours.trim() || null,
      email: outletDraft.email.trim() || null,
      map_embed_url: outletDraft.map_embed_url.trim() || null,
      map_link: outletDraft.map_link.trim() || null,
      image_url: outletDraft.image_url.trim() || null,
      enabled: outletDraft.enabled,
      is_primary: outletDraft.is_primary,
      sort_order: Number(outletDraft.sort_order || 0),
    };
    if (outletDraft.id) payload.id = outletDraft.id;
    const { error } = await db.from('outlets').upsert(payload);
    if (error) return toast.error(error.message);
    toast.success('Outlet saved');
    setOutletDraft(null);
    loadAdminData();
  };

  const deleteOutlet = async (id: string) => {
    if (!window.confirm('Delete this outlet?')) return;
    const { error } = await db.from('outlets').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Outlet deleted');
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
                    uploadFn={uploadImage}
                    onUpload={async (file) => {
                      const url = await uploadImage(file);
                      if (url) setProductDraft((draft) => draft ? { ...draft, image: url, imagesText: [draft.imagesText, url].filter(Boolean).join('\n') } : draft);
                    }}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const lowStock = product.stock > 0 && product.stock <= ((product as any).low_stock_threshold ?? 3);
                    const outOfStock = product.stock <= 0;
                    return (
                      <AdminCard key={product.id} className="group relative flex flex-col gap-3 p-3 transition-all hover:shadow-lg hover:-translate-y-0.5">
                        <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[4/5]">
                          <img src={resolveImage(product.data?.image)} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {product.is_featured && <Badge className="text-[10px] px-1.5 py-0">Featured</Badge>}
                            {product.is_sale && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Sale</Badge>}
                            {!product.is_visible && <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">Hidden</Badge>}
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur ${outOfStock ? 'bg-destructive/90 text-destructive-foreground' : lowStock ? 'bg-amber-500/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {outOfStock ? 'Out' : lowStock ? `${product.stock} left` : `${product.stock}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h3 className="font-heading text-sm leading-tight line-clamp-2">{product.name}</h3>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{product.category} · {product.sku || product.id.slice(0, 6)}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-base text-primary">{money(product.price)}</span>
                            {product.original_price && Number(product.original_price) > Number(product.price) && (
                              <span className="text-xs text-muted-foreground line-through">{money(product.original_price)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-1 border-t border-border">
                          <Button variant="outline" size="sm" onClick={() => setProductDraft(productToDraft(product))} className="flex-1 h-8 text-xs gap-1"><PenLine size={12} /> Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 size={12} /></Button>
                        </div>
                      </AdminCard>
                    );
                  })}
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

            {activeTab === 'payments' && (
              <PaymentsPanel orders={orders} profileById={profileById} siteContent={siteContent} updateOrder={updateOrder} reload={loadAdminData} />
            )}

            {activeTab === 'customers' && (
              <CustomersPanel
                customers={filteredCustomers}
                orders={orders}
                selectedCustomer={selectedCustomer}
                selectedCustomerOrders={selectedCustomerOrders}
                selectCustomer={setSelectedCustomerId}
              />
            )}

            {activeTab === 'admins' && (
              <AdminManagementPanel
                profiles={profiles}
                adminRoleIds={adminRoleIds}
                roleByUser={roleByUser}
                isSuperAdmin={isSuperAdmin}
                currentUserEmail={user.email ?? ''}
                currentUserId={user.id}
                reload={loadAdminData}
                uploadFn={uploadImage}
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
                deleteCategoryBanner={deleteCategoryBanner}
                contentDraft={contentDraft}
                setContentDraft={setContentDraft}
                saveContent={saveContent}
                uploadFn={uploadImage}

              />
            )}

            {activeTab === 'subscribers' && (
              <SubscribersPanel subscribers={subscribers} />
            )}

            {activeTab === 'inventory' && (
              <InventoryPanel products={products} />
            )}

            {activeTab === 'outlets' && (
              <OutletsPanel
                outlets={outlets}
                draft={outletDraft}
                setDraft={setOutletDraft}
                save={saveOutlet}
                remove={deleteOutlet}
                uploadFn={uploadImage}
              />
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
  { key: 'payments', label: 'Payments', title: 'Payments & MFS Verification', icon: Wallet },
  { key: 'customers', label: 'Customers', title: 'Customers & Purchase History', icon: Users },
  { key: 'subscribers', label: 'Subscribers', title: 'Newsletter Subscribers', icon: Mail },
  { key: 'outlets', label: 'Outlets', title: 'Outlet & Store Locations', icon: MapPin },
  { key: 'content', label: 'Content', title: 'Website Content', icon: ImageIcon },
  { key: 'admins', label: 'Admin Management', title: 'Administrators & Access Control', icon: ShieldCheck },
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
      {subscribers.length === 0 ? (
        <AdminCard><p className="text-center text-muted-foreground py-10">No subscribers yet.</p></AdminCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subscribers.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4 hover:border-accent transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">via {s.source}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const InventoryPanel = ({ products }: { products: ProductRow[] }) => {
  const LOW = 3;
  const [activeCat, setActiveCat] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name' | 'stock-asc' | 'stock-desc'>('latest');

  const totals = useMemo(() => {
    const out = products.filter((p) => p.stock <= 0).length;
    const low = products.filter((p) => p.stock > 0 && p.stock < LOW).length;
    const inS = products.filter((p) => p.stock >= LOW).length;
    return { total: products.length, out, low, inS };
  }, [products]);

  const categoryGroups = useMemo(() => {
    const map = new Map<string, ProductRow[]>();
    for (const p of products) {
      const k = (p.category || 'others').toLowerCase();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    return Array.from(map.entries())
      .map(([key, items]) => ({
        key,
        label: key.replace(/-/g, ' '),
        count: items.length,
        stock: items.reduce((s, p) => s + (p.stock || 0), 0),
        items,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filtered = useMemo(() => {
    let list = activeCat === 'all' ? products : products.filter((p) => (p.category || '').toLowerCase() === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q));
    }
    if (stockFilter === 'in') list = list.filter((p) => p.stock >= LOW);
    if (stockFilter === 'low') list = list.filter((p) => p.stock > 0 && p.stock < LOW);
    if (stockFilter === 'out') list = list.filter((p) => p.stock <= 0);
    const sorted = [...list];
    if (sortBy === 'latest') sorted.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
    if (sortBy === 'oldest') sorted.sort((a: any, b: any) => (a.created_at || '').localeCompare(b.created_at || ''));
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'stock-asc') sorted.sort((a, b) => a.stock - b.stock);
    if (sortBy === 'stock-desc') sorted.sort((a, b) => b.stock - a.stock);
    return sorted;
  }, [products, activeCat, query, stockFilter, sortBy]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl">Inventory Management</h2>
        <p className="text-sm text-muted-foreground">Category-wise stock control. Customers never see exact numbers.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={Package} label="Total Products" value={totals.total} detail="All catalog items" />
        <Metric icon={CheckCircle2} label="Active / In Stock" value={totals.inS} detail="Healthy stock level" />
        <Metric icon={Boxes} label="Low Stock" value={totals.low} detail={`Below ${LOW} units`} />
        <Metric icon={ShieldCheck} label="Out of Stock" value={totals.out} detail="Hidden CTA on storefront" />
      </div>

      <AdminCard>
        <PanelTitle icon={Boxes} title="Browse by Category" subtitle="Tap a category to filter the inventory list." />
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCat('all')}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${activeCat === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
          >
            All <span className="ml-1 opacity-70">({totals.total})</span>
          </button>
          {categoryGroups.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setActiveCat(g.key)}
              className={`rounded-full border px-4 py-2 text-xs font-medium capitalize transition-all ${activeCat === g.key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
            >
              {g.label} <span className="ml-1 opacity-70">({g.count} · {g.stock}u)</span>
            </button>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PanelTitle icon={Boxes} title="Stock Ledger" subtitle={`${filtered.length} product${filtered.length === 1 ? '' : 's'} shown`} />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU…"
              className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name (A–Z)</option>
            <option value="stock-asc">Stock (Low → High)</option>
            <option value="stock-desc">Stock (High → Low)</option>
          </select>
        </div>

        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                <th className="py-3 pr-3">Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3 text-right">Remaining</th>
                <th className="py-3 px-3 text-right">Sold</th>
                <th className="py-3 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sold = (p as any).sold_count ?? 0;
                const isOut = p.stock <= 0;
                const isLow = !isOut && p.stock < LOW;
                const label = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
                const tone = isOut ? 'bg-destructive/10 text-destructive' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
                const dot = isOut ? 'bg-destructive' : isLow ? 'bg-amber-500' : 'bg-green-600';
                return (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-secondary/40">
                    <td className="py-3 pr-3 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground capitalize">{p.category}</td>
                    <td className="py-3 px-3 text-muted-foreground">{p.sku || '—'}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{p.stock}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{sold}</td>
                    <td className="py-3 pl-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No products match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 md:hidden space-y-3">
          {filtered.map((p) => {
            const sold = (p as any).sold_count ?? 0;
            const isOut = p.stock <= 0;
            const isLow = !isOut && p.stock < LOW;
            const label = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
            const tone = isOut ? 'bg-destructive/10 text-destructive' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
            return (
              <div key={p.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{p.category} · {p.sku || 'No SKU'}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{label}</span>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span>Remaining: <b className="text-foreground tabular-nums">{p.stock}</b></span>
                  <span>Sold: <b className="text-foreground tabular-nums">{sold}</b></span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No products match these filters.</p>}
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

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '28', '30', '32', '34', '36', '38', '40'];
const SizesPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const selected = new Set(value.split(',').map((s) => s.trim()).filter(Boolean));
  const toggle = (size: string) => {
    const next = new Set(selected);
    next.has(size) ? next.delete(size) : next.add(size);
    onChange(Array.from(next).join(', '));
  };
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body">Sizes</span>
        <button type="button" onClick={() => onChange('XS, S, M, L, XL, XXL, XXXL')} className="text-[10px] uppercase tracking-[0.18em] text-accent hover:underline">Select All Mens</button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {STANDARD_SIZES.map((size) => {
          const active = selected.has(size);
          return (
            <button key={size} type="button" onClick={() => toggle(size)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? 'bg-accent text-accent-foreground border-accent shadow-sm' : 'bg-background text-muted-foreground border-border hover:border-accent hover:text-foreground'}`}>{size}</button>
          );
        })}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Or type custom sizes, comma-separated" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
    </div>
  );
};

const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);

type InfoKey = 'fabricInfo' | 'careInfo' | 'shippingInfo' | 'returnsInfo' | 'faqsInfo';
const INFO_FIELDS: { key: InfoKey; label: string; hint: string; defaultKey: 'fabric' | 'care' | 'shipping' | 'returns' | 'faqs' }[] = [
  { key: 'fabricInfo', label: 'Fabric & Material', hint: 'Use "- " for bullets. Auto-filled with brand default — edit for product specifics.', defaultKey: 'fabric' },
  { key: 'careInfo', label: 'Care Instructions', hint: 'Wash, iron, storage notes. One per line with "- ".', defaultKey: 'care' },
  { key: 'shippingInfo', label: 'Shipping Information', hint: 'Delivery rules. Edit per-product if needed.', defaultKey: 'shipping' },
  { key: 'returnsInfo', label: 'Return & Exchange Policy', hint: 'Default Delilar policy — check-at-delivery only. Override only if necessary.', defaultKey: 'returns' },
  { key: 'faqsInfo', label: 'FAQs', hint: 'Format: "Question?:" on its own line, then the answer below. Blank line between Q&A pairs.', defaultKey: 'faqs' },
];

const InfoSectionsEditor = ({ draft, setDraft }: { draft: ProductDraft; setDraft: (updater: (d: ProductDraft | null) => ProductDraft | null) => void }) => {
  const [openKey, setOpenKey] = useState<InfoKey>('fabricInfo');
  const set = (key: InfoKey, value: string) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const resetToDefault = (key: InfoKey, defaultKey: 'fabric' | 'care' | 'shipping' | 'returns' | 'faqs') => {
    const d = defaultInfoSections();
    set(key, d[defaultKey]);
    toast.success('Reset to default');
  };
  return (
    <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Product Info Sections</p>
          <p className="text-sm text-foreground/80 mt-1">Auto-filled with brand defaults. Edit any section for product-specific notes — saved per product.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {INFO_FIELDS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setOpenKey(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${openKey === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {INFO_FIELDS.filter((f) => f.key === openKey).map((f) => (
        <div key={f.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{f.label}</span>
            <button type="button" onClick={() => resetToDefault(f.key, f.defaultKey)} className="text-[11px] text-accent hover:underline">
              Reset to default
            </button>
          </div>
          <textarea
            value={draft[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
            rows={10}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <p className="text-[11px] text-muted-foreground">{f.hint}</p>
        </div>
      ))}
    </div>
  );
};

const ColorVariantsEditor = ({ variants, setVariants, uploadFn }: { variants: ColorVariantDraft[]; setVariants: (next: ColorVariantDraft[]) => void; uploadFn: (file: File) => Promise<string | null> }) => {
  const update = (idx: number, patch: Partial<ColorVariantDraft>) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };
  const updateImage = (idx: number, slot: 0 | 1, url: string) => {
    const next = [...variants];
    const imgs: [string, string] = [...next[idx].images] as [string, string];
    imgs[slot] = url;
    next[idx] = { ...next[idx], images: imgs };
    setVariants(next);
  };
  const move = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= variants.length) return;
    const next = [...variants];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setVariants(next);
  };
  const add = () =>
    setVariants([...variants, { name: '', hex: '#000000', sku: '', stock: '', images: ['', ''] }]);
  const remove = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-heading text-lg">Color Variants</h4>
          <p className="text-xs text-muted-foreground">Unlimited colors · 2 images per color · stock & SKU per variant.</p>
        </div>
        <Button type="button" onClick={add} className="gap-2"><Plus size={14} /> Add Color</Button>
      </div>
      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">No color variants yet. Add one to enable image switching on the storefront.</p>
      )}
      <div className="space-y-4">
        {variants.map((variant, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-4">
            <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-start">
              <div className="grid md:grid-cols-4 gap-3">
                <Field label="Color Name" value={variant.name} onChange={(v) => update(idx, { name: v })} placeholder="Black / Olive / Cream" />
                <label className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body">Hex Code</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={variant.hex || '#000000'} onChange={(e) => update(idx, { hex: e.target.value })} className="w-12 h-10 rounded-lg border border-border bg-background cursor-pointer" />
                    <input type="text" value={variant.hex} onChange={(e) => update(idx, { hex: e.target.value })} placeholder="#000000" className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
                  </div>
                </label>
                <Field label="Variant SKU" value={variant.sku ?? ''} onChange={(v) => update(idx, { sku: v })} placeholder="optional" />
                <Field label="Variant Stock" type="number" value={variant.stock ?? ''} onChange={(v) => update(idx, { stock: v })} placeholder="0" />
              </div>
              <div className="flex lg:flex-col gap-2 lg:items-end">
                <Button type="button" variant="outline" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0}>↑</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => move(idx, 1)} disabled={idx === variants.length - 1}>↓</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => remove(idx)} className="text-destructive hover:text-destructive gap-1"><Trash2 size={13} /></Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 max-w-md">
              {[0, 1].map((slot) => (
                <div key={slot} className="rounded-lg border border-border bg-background/80 p-2">
                  <div className="flex items-center gap-2">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex items-center justify-center shrink-0 border border-border">
                      {variant.images[slot] ? (
                        <img src={variant.images[slot]} alt={`${variant.name} ${slot + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{slot === 0 ? 'Main · Image 1' : 'Hover · Image 2'}</p>
                      <label className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2 py-1.5 text-[11px] text-muted-foreground cursor-pointer hover:border-accent hover:text-foreground transition-all">
                        <Upload size={11} /> {variant.images[slot] ? 'Replace' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadFn(file);
                            if (url) updateImage(idx, slot as 0 | 1, url);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={variant.images[slot]}
                    onChange={(e) => updateImage(idx, slot as 0 | 1, e.target.value)}
                    placeholder="or paste image URL"
                    className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-accent"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ImageSlot = ({ label, value, onChange, uploadFn, uploading }: { label: string; value: string; onChange: (v: string) => void; uploadFn: (file: File) => Promise<string | null>; uploading?: boolean }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-background/80 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body">{label}</span>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-[10px] uppercase tracking-wider text-destructive hover:underline">Remove</button>
        )}
      </div>
      <div className="aspect-square rounded-lg overflow-hidden bg-secondary border border-border flex items-center justify-center">
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={28} className="text-muted-foreground/50" />
        )}
      </div>
      <label className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-2 py-2 text-[11px] text-muted-foreground cursor-pointer hover:border-accent hover:text-foreground transition-all">
        {busy || uploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
        {value ? 'Replace image' : 'Upload image'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            const url = await uploadFn(file);
            setBusy(false);
            if (url) onChange(url);
            e.target.value = '';
          }}
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste image URL"
        className="mt-1.5 w-full rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus:border-accent"
      />
    </div>
  );
};

const HoverPreviewCard = ({ primary, hover }: { primary: string; hover?: string }) => {
  const [hover2, setHover2] = useState(false);
  return (
    <div
      className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-border bg-secondary cursor-pointer"
      onMouseEnter={() => setHover2(true)}
      onMouseLeave={() => setHover2(false)}
      onTouchStart={() => setHover2((v) => !v)}
      title="Hover to preview"
    >
      {primary ? (
        <img src={primary} alt="Primary preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out" style={{ transform: hover2 && hover ? 'scale(1.05)' : 'scale(1)' }} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">Upload Image 1 to preview</div>
      )}
      {hover && (
        <img src={hover} alt="Hover preview" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${hover2 ? 'opacity-100' : 'opacity-0'}`} />
      )}
      <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.22em] bg-background/85 backdrop-blur px-2 py-1 rounded-md text-foreground border border-border">
        {hover2 && hover ? 'Image 2 · Hover' : 'Image 1 · Main'}
      </span>
    </div>
  );
};

const ProductImagePair = ({ draft, setDraft, uploading, onUpload, uploadFn }: { draft: ProductDraft; setDraft: (draft: ProductDraft) => void; uploading: boolean; onUpload: (file: File) => void; uploadFn: (file: File) => Promise<string | null> }) => {
  const lines = draft.imagesText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const hoverImage = lines[0] ?? '';
  const setHover = (v: string) => {
    const rest = lines.slice(1);
    const next = [v, ...rest].filter(Boolean).join('\n');
    setDraft({ ...draft, imagesText: next });
  };
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-heading text-base">Product Images</h4>
        <p className="text-[11px] text-muted-foreground">Image 1 shows by default. Image 2 fades in on hover for a premium product card experience. Color variants below override these on the storefront.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ImageSlot
          label="Main · Image 1"
          value={draft.image}
          onChange={(v) => setDraft({ ...draft, image: v })}
          uploadFn={uploadFn}
          uploading={uploading}
        />
        <ImageSlot
          label="Hover · Image 2"
          value={hoverImage}
          onChange={setHover}
          uploadFn={uploadFn}
        />
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-body mb-2">Live Preview</p>
          <HoverPreviewCard primary={draft.image} hover={hoverImage || undefined} />
        </div>
      </div>
    </div>
  );
};



const ProductEditor = ({ draft, setDraft, categories, save, uploading, onUpload, uploadFn }: { draft: ProductDraft; setDraft: (draft: ProductDraft | null | ((draft: ProductDraft | null) => ProductDraft | null)) => void; categories: { id: string; name: string }[]; save: () => void; uploading: boolean; onUpload: (file: File) => void; uploadFn: (file: File) => Promise<string | null> }) => (
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
      <ProductImagePair
        draft={draft}
        setDraft={(next) => setDraft(next)}
        uploading={uploading}
        onUpload={onUpload}
        uploadFn={uploadFn}
      />
    </div>
    <div className="mt-4">
      <Field label="Additional Gallery Images (optional)" value={(() => { const lines = draft.imagesText.split(/\r?\n/).filter(Boolean); return lines.slice(1).join('\n'); })()} onChange={(v) => {
        const hover = draft.imagesText.split(/\r?\n/).filter(Boolean)[0] ?? '';
        const extras = v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        setDraft({ ...draft, imagesText: [hover, ...extras].filter(Boolean).join('\n') });
      }} rows={3} placeholder="One image URL per line — shown in the product detail gallery" />
    </div>
    <div className="mt-4">
      <SizesPicker value={draft.sizesText} onChange={(v) => setDraft({ ...draft, sizesText: v })} />
    </div>
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
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
    <InfoSectionsEditor draft={draft} setDraft={(updater) => setDraft(updater)} />
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        <TogglePill active={draft.is_visible} label="Visible" onClick={() => setDraft({ ...draft, is_visible: !draft.is_visible })} />
        <TogglePill active={draft.is_featured} label="Featured" onClick={() => setDraft({ ...draft, is_featured: !draft.is_featured })} />
        <TogglePill active={draft.is_new} label="New" onClick={() => setDraft({ ...draft, is_new: !draft.is_new })} />
        <TogglePill active={draft.is_trending} label="Trending" onClick={() => setDraft({ ...draft, is_trending: !draft.is_trending })} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-body uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          New until
        </label>
        <input
          type="date"
          value={draft.new_until}
          onChange={(e) => setDraft({ ...draft, new_until: e.target.value })}
          className="border border-border bg-background rounded-md px-2 py-1.5 text-xs font-body outline-none focus:border-accent"
          title="Extend New Arrival visibility past the default 120 days"
        />
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

const orderStatusStyle = (status: string) => {
  const map: Record<string, string> = {
    warehouse: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    packaging: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    transit: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    delivered: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    refunded: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  };
  return map[status] || 'bg-muted text-muted-foreground border-border';
};

const OrdersPanel = ({ orders, profileById, trackingDrafts, setTrackingDrafts, updateOrder, saveTracking }: any) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <section className="space-y-5">
      <div><h2 className="font-heading text-2xl">Orders</h2><p className="text-sm text-muted-foreground">View order details, customer shipping information, delivery tracking, cancellations, and refunds.</p></div>
      {orders.length === 0 && <AdminCard><p className="text-center text-muted-foreground py-10">No orders yet.</p></AdminCard>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order: OrderRow) => {
          const customer = profileById.get(order.user_id);
          const draft = trackingDrafts[order.id] ?? order;
          const isOpen = expanded[order.id];
          return (
            <AdminCard key={order.id} className="p-0 overflow-hidden transition-all hover:shadow-lg">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-heading text-lg">#{shortId(order.id)}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${orderStatusStyle(order.status)}`}>{order.status}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusStyle(order.payment_status)}`}>{order.payment_status ?? 'pending'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-lg text-primary">{money(order.total)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{order.payment_method} · {order.items?.length ?? 0} items</p>
                  </div>
                </div>
                <div className="rounded-xl bg-background/60 border border-border p-3 text-sm">
                  <p className="font-medium truncate">{customer?.full_name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{customer?.email || customer?.phone || 'No contact'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(order.status === 'warehouse' || order.status === 'packaging') && (
                    <>
                      <Button size="sm" className="h-8 text-xs" onClick={() => updateOrder(order.id, { status: 'packaging' })}>Approve</Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => updateOrder(order.id, { status: 'transit' })}>Mark Shipped</Button>
                    </>
                  )}
                  {order.status === 'transit' && (
                    <Button size="sm" className="h-8 text-xs" onClick={() => updateOrder(order.id, { status: 'delivered' })}>Mark Delivered</Button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="inline-flex items-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-600">Delivered</span>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'delivered' && (
                    <Button size="sm" variant="outline" className="h-8 text-xs text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => updateOrder(order.id, { status: 'cancelled', cancelled_at: new Date().toISOString() })}>Reject</Button>
                  )}
                  <select value={order.status} onChange={(event) => updateOrder(order.id, { status: event.target.value })} className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs">
                    {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={() => setExpanded((p) => ({ ...p, [order.id]: !isOpen }))}>
                    {isOpen ? 'Hide' : 'Details'}
                  </Button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-border bg-background/40 p-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Customer</p>
                      <p className="font-medium text-foreground">{(order.shipping_address as any)?.fullName || customer?.full_name || '—'}</p>
                      <p className="text-muted-foreground">{(order.shipping_address as any)?.phone || customer?.phone || '—'}</p>
                      <p className="text-muted-foreground">{(order.shipping_address as any)?.email || customer?.email || '—'}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Shipping Address</p>
                      {(() => {
                        const a: any = order.shipping_address || {};
                        const line = [a.house_number, a.village, a.upazila, a.district].filter(Boolean).join(', ');
                        return <p className="text-muted-foreground">{line || a.address || [customer?.house_number, customer?.village, customer?.upazila, customer?.district].filter(Boolean).join(', ') || '—'}</p>;
                      })()}
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Payment</p>
                      <p className="text-foreground capitalize">{order.payment_method} · {order.payment_status ?? 'pending'}</p>
                      {order.txn_id && <p className="text-muted-foreground">TXN: {order.txn_id}</p>}
                      {order.payer_number && <p className="text-muted-foreground">From: {order.payer_number}</p>}
                      {order.screenshot_url && (
                        <a href={order.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">View screenshot →</a>
                      )}
                    </div>
                    <div className="rounded-xl border border-border bg-background p-3 text-xs">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Items</p>
                      <div className="space-y-0.5 text-muted-foreground max-h-24 overflow-auto">{(order.items ?? []).map((item, index) => <p key={index}>{item.name || item.product?.name || 'Item'} × {item.quantity || 1}</p>)}</div>
                    </div>
                  </div>
                  {(order.shipping_address as any)?.note && (
                    <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-xs">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">Customer Order Note</p>
                      <p className="text-foreground whitespace-pre-wrap">{(order.shipping_address as any).note}</p>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-3 gap-2">
                    <Field label="Courier" value={String(draft.courier ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], courier: v } }))} />
                    <Field label="Tracking #" value={String(draft.tracking_number ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], tracking_number: v } }))} />
                    <Field label="Tracking URL" value={String(draft.tracking_url ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], tracking_url: v } }))} />
                  </div>
                  <Field label="Admin Notes" value={String(draft.admin_notes ?? '')} onChange={(v) => setTrackingDrafts((prev: any) => ({ ...prev, [order.id]: { ...prev[order.id], admin_notes: v } }))} rows={2} />
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => updateOrder(order.id, { status: 'refunded', refunded_at: new Date().toISOString() })}>Refund</Button>
                    <Button size="sm" onClick={() => saveTracking(order)}>Save Tracking</Button>
                  </div>
                </div>
              )}
            </AdminCard>
          );
        })}
      </div>
    </section>
  );
};

const CustomersPanel = ({ customers, orders, selectedCustomer, selectedCustomerOrders, selectCustomer }: any) => {
  const [sortKey, setSortKey] = useState<'name' | 'date' | 'orders'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const enriched = useMemo(() => customers.map((c: ProfileRow) => {
    const cOrders = orders.filter((o: OrderRow) => o.user_id === c.id);
    return {
      ...c,
      _orderCount: cOrders.length,
      _spend: cOrders.reduce((s: number, o: OrderRow) => s + Number(o.total || 0), 0),
    };
  }), [customers, orders]);

  const sorted = useMemo(() => {
    const arr = [...enriched];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = (a.full_name || '').localeCompare(b.full_name || '');
      else if (sortKey === 'orders') cmp = a._orderCount - b._orderCount;
      else cmp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [enriched, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [customers.length, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const exportCsv = () => {
    const header = ['Name', 'Phone', 'Email', 'House/Village', 'Upazila', 'District', 'Address', 'Orders', 'Total Spend (BDT)', 'Registered'];
    const rows = customers.map((c: ProfileRow) => {
      const cOrders = orders.filter((o: OrderRow) => o.user_id === c.id);
      const spend = cOrders.reduce((s: number, o: OrderRow) => s + Number(o.total || 0), 0);
      return [
        c.full_name || '', c.phone || '', c.email || '',
        [c.house_number, c.village].filter(Boolean).join(' '),
        c.upazila || '', c.district || c.city || '',
        c.address || c.detailed_address || '',
        String(cOrders.length), String(spend),
        c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : '',
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delilar-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHead = ({ k, children }: { k: typeof sortKey; children: any }) => (
    <button type="button" onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 text-left font-medium uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground">
      {children}
      {sortKey === k && <span className="text-accent">{sortDir === 'asc' ? '▲' : '▼'}</span>}
    </button>
  );

  return (
    <section className="grid xl:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl">Customers</h2>
            <p className="text-sm text-muted-foreground">Customer profiles, contact details and purchase history. Administrator accounts are managed separately under Admin Management.</p>
          </div>
          <Button onClick={exportCsv} disabled={!customers.length} className="gap-2">
            <Download size={15} /> Export CSV
          </Button>
        </div>
        <AdminCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3"><SortHead k="name">Customer</SortHead></th>
                  <th className="text-left px-4 py-3 hidden md:table-cell text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Contact</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Location</th>
                  <th className="text-left px-4 py-3"><SortHead k="date">Registered</SortHead></th>
                  <th className="text-right px-4 py-3"><SortHead k="orders">Orders</SortHead></th>
                  <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Spend</th>
                  <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((customer: any) => (
                  <tr key={customer.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${selectedCustomer?.id === customer.id ? 'bg-accent/5' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{customer.full_name || 'Unnamed Customer'}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{customer.email || customer.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs">{customer.email || '—'}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{customer.district || customer.city || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{customer._orderCount}</td>
                    <td className="px-4 py-3 text-right text-xs">{money(customer._spend)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => selectCustomer(customer.id)}>View</Button>
                    </td>
                  </tr>
                ))}
                {!pageRows.length && (
                  <tr><td colSpan={7} className="text-center text-muted-foreground py-10">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages} · {sorted.length} customers</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </AdminCard>
      </div>
      <AdminCard className="xl:sticky xl:top-28 xl:self-start">
        {selectedCustomer ? <><PanelTitle icon={UserCog} title={selectedCustomer.full_name || 'Customer Profile'} subtitle={selectedCustomer.email || selectedCustomer.id} /><div className="mt-5 space-y-3 text-sm"><InfoRow label="Phone" value={selectedCustomer.phone || '—'} /><InfoRow label="Address" value={[selectedCustomer.house_number, selectedCustomer.village, selectedCustomer.upazila, selectedCustomer.district].filter(Boolean).join(', ') || selectedCustomer.address || '—'} /><InfoRow label="Orders" value={String(selectedCustomerOrders.length)} /><InfoRow label="Total Spend" value={money(selectedCustomerOrders.reduce((sum: number, order: OrderRow) => sum + Number(order.total || 0), 0))} /></div><div className="mt-5 space-y-2"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Purchase History</p>{selectedCustomerOrders.map((order: OrderRow) => <div key={order.id} className="rounded-xl border border-border bg-background p-3 text-sm"><p className="font-medium">#{shortId(order.id)} · {money(order.total)}</p><p className="text-muted-foreground">{order.status} · {new Date(order.created_at).toLocaleDateString()}</p></div>)}</div></> : <p className="text-sm text-muted-foreground">Select a customer to view profile and purchase history.</p>}
      </AdminCard>
    </section>
  );
};

type AdminFormState = {
  id?: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  role: 'admin' | 'super_admin' | 'manager' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string;
  department: string;
  notes: string;
};

const emptyAdminForm = (): AdminFormState => ({
  full_name: '', username: '', email: '', phone: '', password: '', confirm: '',
  role: 'admin', status: 'active', avatar_url: '', department: '', notes: '',
});

const AdminManagementPanel = ({ profiles, adminRoleIds, roleByUser, isSuperAdmin, currentUserEmail, currentUserId, reload, uploadFn }: any) => {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AdminFormState>(emptyAdminForm());
  const [busy, setBusy] = useState(false);
  const [resetFor, setResetFor] = useState<ProfileRow | null>(null);
  const [resetPwd, setResetPwd] = useState({ password: '', confirm: '' });

  const admins = useMemo(() => profiles.filter((p: ProfileRow) => adminRoleIds.has(p.id) || p.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()), [profiles, adminRoleIds]);
  const filteredAdmins = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return admins;
    return admins.filter((a: ProfileRow) => [a.full_name, a.email, a.phone, a.username, a.department].some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [admins, search]);

  const callEdge = async (action: string, body: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke('admin-manage-user', { body: { action, ...body } });
    if (error) {
      const msg = (data as any)?.error || error.message;
      throw new Error(msg);
    }
    if ((data as any)?.error) throw new Error((data as any).error);
    return data;
  };

  const openCreate = () => { setForm(emptyAdminForm()); setFormOpen(true); };
  const openEdit = (p: ProfileRow) => {
    setForm({
      id: p.id,
      full_name: p.full_name ?? '',
      username: p.username ?? '',
      email: p.email ?? '',
      phone: p.phone ?? '',
      password: '', confirm: '',
      role: (roleByUser.get(p.id) as any) ?? 'admin',
      status: (p.status as any) ?? 'active',
      avatar_url: p.avatar_url ?? '',
      department: p.department ?? '',
      notes: p.notes ?? '',
    });
    setFormOpen(true);
  };

  const submit = async () => {
    if (!form.full_name.trim()) return toast.error('Full name is required');
    if (!form.id) {
      if (!form.email.trim()) return toast.error('Email is required');
      if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
      if (form.password !== form.confirm) return toast.error('Passwords do not match');
    }
    setBusy(true);
    try {
      if (form.id) {
        await callEdge('update', {
          user_id: form.id,
          full_name: form.full_name.trim(),
          username: form.username.trim() || null,
          phone: form.phone.trim() || null,
          avatar_url: form.avatar_url || null,
          department: form.department.trim() || null,
          notes: form.notes.trim() || null,
          status: form.status,
          ...(isSuperAdmin && { role: form.role }),
        });
        toast.success('Administrator updated');
      } else {
        await callEdge('create', {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          full_name: form.full_name.trim(),
          username: form.username.trim() || null,
          phone: form.phone.trim() || null,
          role: form.role,
          status: form.status,
          avatar_url: form.avatar_url || null,
          department: form.department.trim() || null,
          notes: form.notes.trim() || null,
        });
        toast.success('Administrator created');
      }
      setFormOpen(false);
      reload();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (p: ProfileRow, status: string) => {
    try {
      await callEdge('set_status', { user_id: p.id, status });
      toast.success(`Status set to ${status}`);
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const removeAdmin = async (p: ProfileRow) => {
    if (!confirm(`Permanently delete admin ${p.email || p.full_name}? This cannot be undone.`)) return;
    try {
      await callEdge('delete', { user_id: p.id });
      toast.success('Administrator deleted');
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const submitReset = async () => {
    if (!resetFor) return;
    if (resetPwd.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (resetPwd.password !== resetPwd.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try {
      await callEdge('reset_password', { user_id: resetFor.id, password: resetPwd.password });
      toast.success('Password reset');
      setResetFor(null); setResetPwd({ password: '', confirm: '' });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Admin Management</h2>
          <p className="text-sm text-muted-foreground">Manually create and manage administrators. No email invitations are sent.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1"><ShieldCheck size={12} /> {admins.length} total</Badge>
          {isSuperAdmin && (
            <Button onClick={openCreate} className="gap-2"><Plus size={15} /> Add Administrator</Button>
          )}
        </div>
      </div>

      {!isSuperAdmin && (
        <AdminCard><p className="text-sm text-muted-foreground">Only super administrators can create or delete admin accounts. You can still view the list and edit your own profile.</p></AdminCard>
      )}

      <AdminCard className="p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
          <h3 className="font-heading text-lg">Administrators</h3>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search admins" className="pl-9 h-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Admin</th>
                <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Username</th>
                <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Phone</th>
                <th className="text-left font-medium px-4 py-3">Role</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin: ProfileRow) => {
                const isPrimary = admin.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                const isSelf = admin.id === currentUserId;
                const role = roleByUser.get(admin.id) ?? (isPrimary ? 'super_admin' : 'admin');
                const status = admin.status ?? 'active';
                const statusColor = status === 'active' ? 'text-emerald-600 bg-emerald-500' : status === 'suspended' ? 'text-amber-600 bg-amber-500' : 'text-muted-foreground bg-muted-foreground';
                return (
                  <tr key={admin.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xs font-medium">
                          {admin.avatar_url ? <img src={admin.avatar_url} alt="" className="h-full w-full object-cover" /> : (admin.full_name?.[0] || admin.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{admin.full_name || 'Unnamed'}{isSelf && <span className="ml-2 text-[10px] text-muted-foreground">(you)</span>}</div>
                          <div className="text-xs text-muted-foreground truncate">{admin.email || '—'}</div>
                          {admin.department && <div className="text-[10px] text-muted-foreground">{admin.department}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs">{admin.username || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{admin.phone || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={role === 'super_admin' ? 'default' : 'secondary'} className="text-[10px] capitalize">{role.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor.split(' ')[0]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusColor.split(' ')[1]}`} />
                        <span className="capitalize">{status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1 flex-wrap justify-end">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openEdit(admin)}>Edit</Button>
                        {isSuperAdmin && !isPrimary && (
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setResetFor(admin); setResetPwd({ password: '', confirm: '' }); }}>Reset Pwd</Button>
                        )}
                        {isSuperAdmin && !isPrimary && !isSelf && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setStatus(admin, status === 'active' ? 'suspended' : 'active')}>
                              {status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeAdmin(admin)}>Delete</Button>
                          </>
                        )}
                        {isPrimary && <span className="text-xs text-muted-foreground self-center">Protected</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filteredAdmins.length && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-10">No administrators match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <Dialog open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Administrator' : 'Create Administrator'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="sm:col-span-2">
              <UploadPicker value={form.avatar_url} onChange={(v) => setForm({ ...form, avatar_url: v })} uploadFn={uploadFn} label="Profile Image (optional)" />
            </div>
            <div>
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Username</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="login handle (optional)" />
            </div>
            <div>
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!form.id} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            {!form.id && (
              <>
                <div>
                  <Label className="text-xs">Password *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min 8 chars" />
                </div>
                <div>
                  <Label className="text-xs">Confirm Password *</Label>
                  <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })} disabled={!isSuperAdmin}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Department (optional)</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Operations, Content, Support" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={submit} disabled={busy} className="gap-2">
              {busy && <Loader2 size={14} className="animate-spin" />}
              {form.id ? 'Save Changes' : 'Create Administrator'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Set a new password for <span className="font-medium text-foreground">{resetFor?.email}</span>. They will need to use this password on next sign-in.</p>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-xs">New Password</Label>
              <Input type="password" value={resetPwd.password} onChange={(e) => setResetPwd({ ...resetPwd, password: e.target.value })} placeholder="min 8 chars" />
            </div>
            <div>
              <Label className="text-xs">Confirm Password</Label>
              <Input type="password" value={resetPwd.confirm} onChange={(e) => setResetPwd({ ...resetPwd, confirm: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setResetFor(null)} disabled={busy}>Cancel</Button>
            <Button onClick={submitReset} disabled={busy} className="gap-2">
              {busy && <Loader2 size={14} className="animate-spin" />}
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => <div className="flex justify-between gap-4 border-b border-border pb-2"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;

const UploadPicker = ({ value, onChange, uploadFn, label = 'Image' }: { value: string; onChange: (v: string) => void; uploadFn: (file: File) => Promise<string | null>; label?: string }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex gap-3 items-start">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary flex items-center justify-center">
          {value ? <img src={value} alt="preview" className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 space-y-2">
          <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload" />
          <div className="flex gap-2">
            <label className="inline-flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-1.5 text-xs cursor-pointer hover:border-accent hover:text-foreground transition-all">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {value ? 'Replace' : 'Upload from computer'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                setBusy(true);
                const url = await uploadFn(f);
                setBusy(false);
                if (url) onChange(url);
                e.target.value = '';
              }} />
            </label>
            {value && <Button type="button" variant="outline" size="sm" onClick={() => onChange('')}>Remove</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerCard = ({ image, title, subtitle, tag, enabled, onEdit }: any) => (
  <div className="rounded-xl border border-border bg-background overflow-hidden flex flex-col">
    <div className="aspect-[16/9] bg-secondary overflow-hidden">
      {image ? <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><ImageIcon size={24} /></div>}
    </div>
    <div className="p-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{title || 'Untitled'}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        <span className="mt-1 inline-block text-[10px] uppercase tracking-wide rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">{tag}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Live' : 'Hidden'}</Badge>
        <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
      </div>
    </div>
  </div>
);

const ContentPanel = ({ heroBanners, categoryBanners, siteContent, categoryOptions, bannerDraft, setBannerDraft, saveHeroBanner, categoryBannerDraft, setCategoryBannerDraft, saveCategoryBanner, deleteCategoryBanner, contentDraft, setContentDraft, saveContent, uploadFn }: any) => {
  const mediaLibrary = useMemo(() => {
    const items: { url: string; source: string; title: string }[] = [];
    heroBanners.forEach((b: HeroBannerRow) => { if (b.image_url) items.push({ url: b.image_url, source: 'Hero', title: b.title }); if (b.mobile_image_url) items.push({ url: b.mobile_image_url, source: 'Hero (Mobile)', title: b.title }); });
    categoryBanners.forEach((b: CategoryBannerRow) => { if (b.image_url) items.push({ url: b.image_url, source: `Collection · ${b.page ?? b.category}`, title: b.title || (b.page ?? b.category) }); });
    siteContent.forEach((c: ContentRow) => { if (c.image_url) items.push({ url: c.image_url, source: `Content · ${c.type}`, title: c.title }); });
    const seen = new Set<string>();
    return items.filter((i) => { if (seen.has(i.url)) return false; seen.add(i.url); return true; });
  }, [heroBanners, categoryBanners, siteContent]);

  const pageOptions = useMemo(() => {
    const opts = [{ value: 'home', label: 'Home Page' }, { value: 'shop', label: 'Shop / All Products' }];
    categoryOptions.forEach((c: any) => opts.push({ value: c.id, label: `${c.name} Collection` }));
    return opts;
  }, [categoryOptions]);

  const bannersByPage = useMemo(() => {
    const map = new Map<string, CategoryBannerRow[]>();
    categoryBanners.forEach((b: CategoryBannerRow) => {
      const key = b.page ?? b.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    map.forEach((arr) => arr.sort((a, b) => (a.position ?? 1) - (b.position ?? 1)));
    return Array.from(map.entries());
  }, [categoryBanners]);

  const pageLabel = (key: string) => pageOptions.find((o) => o.value === key)?.label ?? key;

  return (
    <section className="space-y-8">
      <div><h2 className="font-heading text-2xl">Website Content</h2><p className="text-sm text-muted-foreground">Upload, organize, and manage hero banners, collection banners, and site content from one place.</p></div>

      <AdminCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <PanelTitle icon={ImageIcon} title="Hero Section Manager" subtitle="Homepage hero slides and campaign banners shown at the top of the site." />
          <Button onClick={() => setBannerDraft(bannerToDraft())}><Plus size={15} /> Add Hero</Button>
        </div>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {heroBanners.length === 0 && <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">No hero banners yet.</p>}
          {heroBanners.map((banner: HeroBannerRow) => <BannerCard key={banner.id} image={banner.image_url} title={banner.title} subtitle={banner.subtitle || banner.cta_href || ''} tag="Hero" enabled={banner.enabled} onEdit={() => setBannerDraft(bannerToDraft(banner))} />)}
        </div>
        {bannerDraft && <HeroBannerEditor draft={bannerDraft} setDraft={setBannerDraft} save={saveHeroBanner} uploadFn={uploadFn} />}
      </AdminCard>

      <AdminCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <PanelTitle icon={Boxes} title="Collection Banner Manager" subtitle="Up to 2 banners per page. Assign to Home, Shop, or any collection page." />
          <Button
            onClick={() => {
              const firstPage = pageOptions[0]?.value ?? 'home';
              const existing = categoryBanners.filter((b: CategoryBannerRow) => (b.page ?? b.category) === firstPage);
              const nextPosition = existing.some((b: CategoryBannerRow) => (b.position ?? 1) === 1) ? 2 : 1;
              setCategoryBannerDraft({ ...categoryBannerToDraft(), page: firstPage, category: firstPage, position: nextPosition });
            }}
          >
            <Plus size={15} /> Add Collection Banner
          </Button>
        </div>
        <div className="mt-5 space-y-6">
          {bannersByPage.length === 0 && <p className="text-sm text-muted-foreground">No collection banners yet. Click “Add Collection Banner” to create one.</p>}
          {bannersByPage.map(([pageKey, banners]) => (
            <div key={pageKey} className="rounded-xl border border-border p-4 bg-background/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{pageLabel(pageKey)}</p>
                  <p className="text-xs text-muted-foreground">{banners.length}/2 banners</p>
                </div>
                {banners.length < 2 && (
                  <Button size="sm" variant="outline" onClick={() => {
                    const nextPosition = banners.some((b) => (b.position ?? 1) === 1) ? 2 : 1;
                    setCategoryBannerDraft({ ...categoryBannerToDraft(), page: pageKey, category: pageKey, position: nextPosition });
                  }}><Plus size={14} /> Add to this page</Button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {banners.map((banner) => (
                  <div key={banner.id} className="rounded-lg border border-border overflow-hidden bg-background">
                    <div className="aspect-[16/9] bg-secondary overflow-hidden">
                      <img src={banner.image_url} alt={banner.title || ''} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{banner.title || pageLabel(pageKey)}</p>
                        <p className="text-xs text-muted-foreground">Banner {banner.position ?? 1} · {banner.enabled ? 'Live' : 'Hidden'}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => setCategoryBannerDraft(categoryBannerToDraft(banner))}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCategoryBanner(banner.id)} aria-label="Delete banner"><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <CategoryBannerEditor draft={categoryBannerDraft} setDraft={setCategoryBannerDraft} save={saveCategoryBanner} pageOptions={pageOptions} uploadFn={uploadFn} />
      </AdminCard>


      <AdminCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <PanelTitle icon={FileText} title="Pages, Footer & Policies" subtitle="Edit About, contact info, footer copy, shipping, return, and privacy content." />
          <Button onClick={() => setContentDraft(contentToDraft())}><Plus size={15} /> Add Content</Button>
        </div>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {siteContent.map((content: ContentRow) => <ContentListItem key={content.id} title={content.title} subtitle={`${content.type} · ${content.content_key}`} enabled={content.enabled} onEdit={() => setContentDraft(contentToDraft(content))} />)}
        </div>
        {contentDraft && <SiteContentEditor draft={contentDraft} setDraft={setContentDraft} save={saveContent} uploadFn={uploadFn} />}
      </AdminCard>

      <AdminCard>
        <PanelTitle icon={ImageIcon} title="General Media Library" subtitle="All images currently used across the site. Click any image to copy its URL for reuse." />
        {mediaLibrary.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No media uploaded yet.</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {mediaLibrary.map((item) => (
              <button key={item.url} type="button" onClick={() => { navigator.clipboard?.writeText(item.url); toast.success('Image URL copied'); }} className="group text-left rounded-lg overflow-hidden border border-border bg-background hover:border-accent transition-all">
                <div className="aspect-square bg-secondary overflow-hidden"><img src={item.url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" loading="lazy" /></div>
                <div className="p-2"><p className="text-[11px] font-medium truncate">{item.title || 'Untitled'}</p><p className="text-[10px] text-muted-foreground truncate">{item.source}</p></div>
              </button>
            ))}
          </div>
        )}
      </AdminCard>
    </section>
  );
};

const ContentListItem = ({ title, subtitle, enabled, onEdit }: any) => <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"><div className="min-w-0"><p className="font-medium text-sm truncate">{title}</p><p className="text-xs text-muted-foreground truncate">{subtitle}</p></div><div className="flex items-center gap-2"><Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Live' : 'Hidden'}</Badge><Button variant="outline" size="sm" onClick={onEdit}>Edit</Button></div></div>;

const HeroBannerEditor = ({ draft, setDraft, save, uploadFn }: any) => <div className="mt-5 grid gap-3 border-t border-border pt-5"><Field label="Eyebrow" value={draft.eyebrow} onChange={(v: string) => setDraft({ ...draft, eyebrow: v })} /><Field label="Title" value={draft.title} onChange={(v: string) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" value={draft.subtitle} onChange={(v: string) => setDraft({ ...draft, subtitle: v })} rows={3} /><UploadPicker label="Desktop Image" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} uploadFn={uploadFn} /><UploadPicker label="Mobile Image" value={draft.mobile_image_url} onChange={(v) => setDraft({ ...draft, mobile_image_url: v })} uploadFn={uploadFn} /><Field label="CTA Label" value={draft.cta_label} onChange={(v: string) => setDraft({ ...draft, cta_label: v })} /><Field label="CTA Link" value={draft.cta_href} onChange={(v: string) => setDraft({ ...draft, cta_href: v })} /><Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v: string) => setDraft({ ...draft, sort_order: v })} /><TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} /><div className="flex gap-2"><Button onClick={save}>Save Hero</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></div>;
const CategoryBannerEditor = ({ draft, setDraft, save, pageOptions, uploadFn }: any) => (
  <Dialog open={!!draft} onOpenChange={(open) => { if (!open) setDraft(null); }}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{draft?.id ? 'Edit Collection Banner' : 'Add Collection Banner'}</DialogTitle>
      </DialogHeader>
      {draft && (
        <div className="grid gap-3">
          <SelectField
            label="Page"
            value={draft.page}
            onChange={(v: string) => setDraft({ ...draft, page: v, category: v })}
            options={pageOptions}
          />
          <SelectField
            label="Position"
            value={String(draft.position)}
            onChange={(v: string) => setDraft({ ...draft, position: Number(v) as 1 | 2 })}
            options={[{ value: '1', label: 'Banner 1' }, { value: '2', label: 'Banner 2' }]}
          />
          <Field label="Title (optional)" value={draft.title} onChange={(v: string) => setDraft({ ...draft, title: v })} />
          <Field label="Subtitle (optional)" value={draft.subtitle} onChange={(v: string) => setDraft({ ...draft, subtitle: v })} />
          <UploadPicker label="Banner Image" value={draft.image_url} onChange={(v: string) => setDraft({ ...draft, image_url: v })} uploadFn={uploadFn} />
          {draft.image_url && (
            <div className="rounded-lg overflow-hidden border border-border aspect-[16/9] bg-secondary">
              <img src={draft.image_url} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
          <TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save}>Save Banner</Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
const SiteContentEditor = ({ draft, setDraft, save, uploadFn }: any) => <div className="mt-5 grid md:grid-cols-2 gap-3 border-t border-border pt-5"><Field label="Content Key" value={draft.content_key} onChange={(v: string) => setDraft({ ...draft, content_key: v })} /><Field label="Type" value={draft.type} onChange={(v: string) => setDraft({ ...draft, type: v })} placeholder="page, footer, policy, section" /><Field label="Title" value={draft.title} onChange={(v: string) => setDraft({ ...draft, title: v })} /><Field label="Subtitle" value={draft.subtitle} onChange={(v: string) => setDraft({ ...draft, subtitle: v })} /><div className="md:col-span-2"><UploadPicker label="Image" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} uploadFn={uploadFn} /></div><Field label="CTA Link" value={draft.cta_href} onChange={(v: string) => setDraft({ ...draft, cta_href: v })} /><Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v: string) => setDraft({ ...draft, sort_order: v })} /><div className="md:col-span-2"><Field label="Body" value={draft.body} onChange={(v: string) => setDraft({ ...draft, body: v })} rows={5} /></div><div className="md:col-span-2 flex items-end gap-2"><TogglePill active={draft.enabled} label={draft.enabled ? 'Enabled' : 'Disabled'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} /><Button onClick={save}>Save Content</Button><Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button></div></div>;


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

const OutletsPanel = ({ outlets, draft, setDraft, save, remove, uploadFn }: { outlets: OutletRow[]; draft: OutletDraft | null; setDraft: (d: OutletDraft | null) => void; save: () => void; remove: (id: string) => void; uploadFn: (file: File) => Promise<string | null> }) => (
  <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-heading text-2xl">Outlet Management</h2>
        <p className="text-sm text-muted-foreground">Add unlimited Delilar outlets with Google Maps, images, phone, hours, and full address.</p>
      </div>
      <Button onClick={() => setDraft(outletToDraft())} className="gap-2"><Plus size={15} /> Add Outlet</Button>
    </div>

    {draft && (
      <AdminCard>
        <div className="flex items-start justify-between gap-4 mb-5">
          <PanelTitle icon={MapPin} title={draft.id ? 'Edit Outlet' : 'Add Outlet'} subtitle="Premium store location for the Contact page." />
          <Button variant="ghost" size="icon" onClick={() => setDraft(null)}><X size={18} /></Button>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Field label="Outlet Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <Field label="City" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} placeholder="Sylhet" />
          <Field label="Sort Order" type="number" value={draft.sort_order} onChange={(v) => setDraft({ ...draft, sort_order: v })} />
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Full Address" value={draft.address} onChange={(v) => setDraft({ ...draft, address: v })} rows={2} placeholder="Sylhet-3100, Bangladesh" />
          </div>
          <Field label="Phone" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} placeholder="+880 1533-413290" />
          <Field label="WhatsApp Number" value={draft.whatsapp} onChange={(v) => setDraft({ ...draft, whatsapp: v })} placeholder="8801533413290" />
          <Field label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
          <Field label="Business Hours" value={draft.hours} onChange={(v) => setDraft({ ...draft, hours: v })} placeholder="Sat–Thu · 10am–9pm" />
          <div className="md:col-span-2"><Field label="Google Maps Embed URL (iframe src)" value={draft.map_embed_url} onChange={(v) => setDraft({ ...draft, map_embed_url: v })} placeholder="https://www.google.com/maps?q=...&output=embed" /></div>
          <Field label="Google Maps Link" value={draft.map_link} onChange={(v) => setDraft({ ...draft, map_link: v })} />
          <div className="md:col-span-2 xl:col-span-3 grid md:grid-cols-[1fr_auto] gap-3 items-end">
            <Field label="Outlet Image URL" value={draft.image_url} onChange={(v) => setDraft({ ...draft, image_url: v })} />
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-2.5 text-sm text-muted-foreground cursor-pointer hover:border-accent hover:text-foreground transition-all">
              <Upload size={14} /> Upload
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadFn(f); if (url) setDraft({ ...draft, image_url: url }); e.target.value = ''; }} />
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <TogglePill active={draft.enabled} label={draft.enabled ? 'Live' : 'Hidden'} onClick={() => setDraft({ ...draft, enabled: !draft.enabled })} />
            <TogglePill active={draft.is_primary} label="Flagship" onClick={() => setDraft({ ...draft, is_primary: !draft.is_primary })} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save}>Save Outlet</Button>
          </div>
        </div>
      </AdminCard>
    )}

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {outlets.length === 0 && <div className="md:col-span-2 xl:col-span-3"><AdminCard><p className="text-center text-muted-foreground py-10">No outlets yet.</p></AdminCard></div>}
      {outlets.map((o) => (
        <AdminCard key={o.id} className="group flex flex-col gap-4 p-4 transition-all hover:shadow-lg">
          <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[16/9]">
            {o.image_url ? (
              <img src={o.image_url} alt={o.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><MapPin size={32} /></div>
            )}
            <div className="absolute top-2 left-2 flex gap-1">
              {o.is_primary && <Badge className="text-[10px] px-1.5 py-0">Flagship</Badge>}
              {!o.enabled && <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-background/80">Hidden</Badge>}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-heading text-lg leading-tight">{o.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{o.address}{o.city ? `, ${o.city}` : ''}</p>
            <p className="text-xs text-muted-foreground pt-1">{o.phone || '—'} · {o.hours || 'Hours not set'}</p>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setDraft(outletToDraft(o))} className="flex-1 gap-1.5 h-8 text-xs"><PenLine size={12} /> Edit</Button>
            <Button variant="outline" size="sm" onClick={() => remove(o.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 size={12} /></Button>
          </div>
        </AdminCard>
      ))}
    </div>
  </section>
);

export default Admin;

const MFS_KEYS = ['bkash', 'nagad', 'rocket'] as const;
type MfsKey = typeof MFS_KEYS[number];
const MFS_LABEL: Record<MfsKey, { name: string; color: string }> = {
  bkash: { name: 'bKash', color: 'bg-[#E2136E]' },
  nagad: { name: 'Nagad', color: 'bg-[#EC1C24]' },
  rocket: { name: 'Rocket', color: 'bg-[#8C3D8B]' },
};

const paymentStatusStyle = (s?: string) => {
  switch (s) {
    case 'paid': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
    case 'failed': return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'refunded': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
  }
};

const PaymentsPanel = ({ orders, profileById, siteContent, updateOrder, reload }: any) => {
  const mfsRow = siteContent.find((c: any) => c.content_key === 'mfs_settings');
  const initial = {
    bkash: { enabled: true, number: '', type: 'Personal' },
    nagad: { enabled: true, number: '', type: 'Personal' },
    rocket: { enabled: true, number: '', type: 'Personal' },
    ...(mfsRow?.data ?? {}),
  };
  const [settings, setSettings] = useState<any>(initial);
  const [savingSettings, setSavingSettings] = useState(false);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mfsRow?.data) setSettings({ ...initial, ...mfsRow.data });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfsRow?.id]);

  const saveSettings = async () => {
    setSavingSettings(true);
    const payload: any = {
      content_key: 'mfs_settings',
      type: 'settings',
      title: 'MFS Payment Accounts',
      enabled: true,
      data: settings,
    };
    if (mfsRow?.id) payload.id = mfsRow.id;
    const { error } = await supabase.from('site_content').upsert(payload);
    setSavingSettings(false);
    if (error) return toast.error(error.message);
    toast.success('Payment settings saved');
    reload();
  };

  const verify = async (order: OrderRow) => {
    await updateOrder(order.id, { payment_status: 'paid' });
  };
  const reject = async (order: OrderRow) => {
    await updateOrder(order.id, { payment_status: 'failed' });
  };

  const viewProof = async (order: OrderRow) => {
    if (!order.screenshot_url) return;
    if (proofUrls[order.id]) {
      window.open(proofUrls[order.id], '_blank');
      return;
    }
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(order.screenshot_url, 3600);
    if (error || !data) return toast.error('Cannot load screenshot');
    setProofUrls((p) => ({ ...p, [order.id]: data.signedUrl }));
    window.open(data.signedUrl, '_blank');
  };

  const mfsOrders = orders.filter((o: OrderRow) => ['bkash', 'nagad', 'rocket'].includes(o.payment_method));
  const pending = mfsOrders.filter((o: OrderRow) => (o.payment_status ?? 'pending') === 'pending');
  const others = mfsOrders.filter((o: OrderRow) => (o.payment_status ?? 'pending') !== 'pending');

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl">Payments & MFS Verification</h2>
        <p className="text-sm text-muted-foreground">Configure bKash/Nagad/Rocket receive numbers and manually verify customer payments.</p>
      </div>

      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <PanelTitle icon={Wallet} title="Merchant numbers" subtitle="These numbers are shown to customers at checkout." />
          <Button onClick={saveSettings} disabled={savingSettings} size="sm">{savingSettings ? 'Saving…' : 'Save changes'}</Button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {MFS_KEYS.map((k) => {
            const v = settings[k] ?? {};
            return (
              <div key={k} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-lg ${MFS_LABEL[k].color} text-white flex items-center justify-center font-heading font-bold text-sm`}>
                    {MFS_LABEL[k].name[0]}
                  </div>
                  <p className="font-heading text-base flex-1">{MFS_LABEL[k].name}</p>
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox" checked={v.enabled !== false}
                      onChange={(e) => setSettings({ ...settings, [k]: { ...v, enabled: e.target.checked } })}
                    />
                    Enabled
                  </label>
                </div>
                <Field
                  label="Number" value={String(v.number ?? '')}
                  onChange={(val: string) => setSettings({ ...settings, [k]: { ...v, number: val } })}
                />
                <Field
                  label="Type (Personal / Merchant)" value={String(v.type ?? 'Personal')}
                  onChange={(val: string) => setSettings({ ...settings, [k]: { ...v, type: val } })}
                />
              </div>
            );
          })}
        </div>
      </AdminCard>

      <div className="space-y-3">
        <h3 className="font-heading text-lg">Pending verification <span className="text-sm text-muted-foreground">({pending.length})</span></h3>
        {pending.length === 0 && <AdminCard><p className="text-sm text-muted-foreground text-center py-6">No payments awaiting verification.</p></AdminCard>}
        {pending.map((order: OrderRow) => (
          <PaymentOrderCard
            key={order.id} order={order} customer={profileById.get(order.user_id)}
            onVerify={() => verify(order)} onReject={() => reject(order)} onViewProof={() => viewProof(order)}
          />
        ))}
      </div>

      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-lg">Processed payments</h3>
          {others.map((order: OrderRow) => (
            <PaymentOrderCard
              key={order.id} order={order} customer={profileById.get(order.user_id)}
              onVerify={() => verify(order)} onReject={() => reject(order)} onViewProof={() => viewProof(order)} compact
            />
          ))}
        </div>
      )}
    </section>
  );
};

const PaymentOrderCard = ({ order, customer, onVerify, onReject, onViewProof, compact }: any) => (
  <AdminCard className="p-5">
    <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`w-11 h-11 rounded-xl ${MFS_LABEL[order.payment_method as MfsKey]?.color ?? 'bg-muted'} text-white flex items-center justify-center font-heading font-bold shrink-0`}>
          {MFS_LABEL[order.payment_method as MfsKey]?.name[0] ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-base">#{shortId(order.id)}</p>
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${paymentStatusStyle(order.payment_status)}`}>
              {order.payment_status ?? 'pending'}
            </span>
            <span className="text-xs text-muted-foreground">{money(order.total)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{customer?.full_name || 'Customer'} · {new Date(order.created_at).toLocaleString()}</p>
          <div className="grid sm:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs">
            <InfoRow label="TXN ID" value={order.txn_id || '—'} />
            <InfoRow label="Paid from" value={order.payer_number || '—'} />
            <InfoRow label="Receive #" value={order.payment_account || '—'} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        {order.screenshot_url && (
          <Button variant="outline" size="sm" onClick={onViewProof} className="gap-1.5"><ImageIcon size={12} /> Screenshot</Button>
        )}
        {!compact && order.payment_status !== 'paid' && (
          <Button size="sm" onClick={onVerify} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"><ShieldCheck size={12} /> Approve</Button>
        )}
        {!compact && order.payment_status !== 'failed' && (
          <Button variant="outline" size="sm" onClick={onReject} className="text-destructive hover:text-destructive">Reject</Button>
        )}
      </div>
    </div>
  </AdminCard>
);
