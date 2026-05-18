import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Product } from '@/data/products';
import { useProduct, useProductsByCategory } from '@/hooks/useCatalog';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  Star, Minus, Plus, Truck, RotateCcw, Shield, Heart, Share2,
  ChevronLeft, ChevronRight, ZoomIn, X, BadgeCheck, Package,
  Headphones, CreditCard, Ruler, MapPin, Clock, Copy, Facebook,
  Twitter, MessageCircle, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog, DialogContent, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import heroImg from '@/assets/hero-main.jpg';
import tshirtImg from '@/assets/category-tshirts.jpg';
import jubbaImg from '@/assets/category-jubba.jpg';
import panjabiImg from '@/assets/category-panjabi.jpg';
import attarImg from '@/assets/category-attar.jpg';
import poloImg from '@/assets/category-polo.jpg';
import bagsImg from '@/assets/category-bags.jpg';
import capsImg from '@/assets/category-caps.jpg';
import perfumeImg from '@/assets/category-perfume.jpg';
import streetwearImg from '@/assets/category-streetwear.jpg';

const categoryImageMap: Record<Product['category'], string> = {
  tshirts: tshirtImg,
  jubba: jubbaImg,
  panjabi: panjabiImg,
  attar: attarImg,
  perfume: perfumeImg,
  eid: jubbaImg,
  accessories: bagsImg,
  polo: poloImg,
  shirts: poloImg,
  pants: streetwearImg,
  hoodies: streetwearImg,
  caps: capsImg,
  bags: bagsImg,
  wallets: bagsImg,
  kuffiyah: capsImg,
  turban: capsImg,
};

const buildGallery = (product: Product, activeColor?: string): string[] => {
  // 1) variant-driven images win
  if (activeColor && product.colorVariants) {
    const v = product.colorVariants.find((cv) => cv.name === activeColor);
    if (v && v.images.length) return v.images;
  }
  // 2) first variant fallback
  if (product.colorVariants && product.colorVariants.length) {
    return product.colorVariants[0].images;
  }
  // 3) explicit images
  if (product.images && product.images.length) return product.images;
  // 4) category-based fallback
  const primary = categoryImageMap[product.category] || heroImg;
  return [primary, heroImg, primary, primary];
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useProduct(id);
  const { data: categoryProducts = [] } = useProductsByCategory(product?.category);
  const { addItem, setIsCartOpen } = useCart();
  const { toggle: toggleWish, has: hasWish } = useWishlist();

  const initialColor = product?.colorVariants?.[0]?.name || product?.colors?.[0] || '';
  const initialVolume = product?.volumeOptions?.[0] || '';

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedVolume, setSelectedVolume] = useState(initialVolume);
  const [selectedFabric, setSelectedFabric] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  const gallery = useMemo(
    () => (product ? buildGallery(product, selectedColor) : []),
    [product, selectedColor]
  );

  // Reset image index when variant images change
  useEffect(() => {
    setActiveImg(0);
  }, [selectedColor]);

  useEffect(() => {
    setActiveImg(0);
    setQuantity(1);
    setSelectedSize('');
    setSelectedColor(product?.colorVariants?.[0]?.name || product?.colors?.[0] || '');
    setSelectedVolume(product?.volumeOptions?.[0] || '');
    setSelectedFabric('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-body text-muted-foreground">Product not found</p>
        <Link to="/" className="text-primary text-sm font-body mt-4 inline-block hover:text-accent transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const related = categoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const sku = `DLR-${product.id.toUpperCase()}`;
  const soldCount = 50 + (product.reviews * 3);

  const handleAddToCart = async (buyNow = false) => {
    if (!product.inStock) return;
    setAdding(true);
    addItem(product, quantity, selectedSize || undefined, selectedColor || undefined);
    toast({ title: 'Added to cart', description: `${quantity} × ${product.name}` });
    await new Promise((r) => setTimeout(r, 350));
    setAdding(false);
    if (buyNow) setIsCartOpen(true);
  };

  const handleShare = async (platform: 'copy' | 'fb' | 'tw' | 'wa') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out ${product.name} on Delilar`;
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied' });
      return;
    }
    const map = {
      fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      tw: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      wa: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };
    window.open(map[platform], '_blank');
  };

  // Rating breakdown (simulated)
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const base = stars === 5 ? 0.7 : stars === 4 ? 0.2 : stars === 3 ? 0.06 : stars === 2 ? 0.03 : 0.01;
    return { stars, count: Math.round(product.reviews * base) };
  });

  const sampleReviews = [
    { name: 'Abdullah R.', rating: 5, date: '2 weeks ago', verified: true, title: 'Exceptional craftsmanship', body: 'The fabric quality and stitching are top-notch. Fits perfectly and feels luxurious. Will buy again.' },
    { name: 'Imran H.', rating: 5, date: '1 month ago', verified: true, title: 'Worth every taka', body: 'Premium feel, elegant design, and delivery was super fast. Delilar never disappoints.' },
    { name: 'Sadiq M.', rating: 4, date: '1 month ago', verified: true, title: 'Great quality', body: 'Beautiful piece, true to size. Packaging was also very premium.' },
  ];

  return (
    <main className="relative pb-28 lg:pb-12">
      {/* Soft luxury background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[hsl(var(--cream))] via-[hsl(var(--cream-dark))] to-[hsl(var(--cream))]" />

      <div className="container mx-auto px-4 lg:px-8 pt-6 lg:pt-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-6 lg:mb-10">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-accent">/</span>
          <Link to={`/${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
          <span className="text-accent">/</span>
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-16">
          {/* ============ GALLERY ============ */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col-reverse lg:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible lg:max-h-[560px] scrollbar-thin">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative shrink-0 w-20 h-20 lg:w-[88px] lg:h-[88px] rounded-xl overflow-hidden transition-all duration-300 ${
                      activeImg === i
                        ? 'ring-2 ring-[hsl(var(--gold))] shadow-[0_0_20px_hsl(var(--gold)/0.35)]'
                        : 'ring-1 ring-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 relative">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[hsl(var(--cream-dark))] shadow-[0_30px_80px_-30px_hsl(var(--burgundy)/0.35)] group">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={gallery[activeImg]}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.badge && (
                      <span className="text-[10px] font-body tracking-[0.2em] uppercase bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] px-3 py-1.5 rounded-md shadow-md">
                        {product.badge}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="text-[10px] font-body tracking-[0.2em] uppercase bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] px-3 py-1.5 rounded-md shadow-md font-semibold">
                        -{discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Out of stock overlay */}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-[hsl(var(--charcoal)/0.55)] backdrop-blur-[2px] z-20 flex items-center justify-center">
                      <span className="px-6 py-3 bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] text-xs tracking-[0.3em] uppercase font-body rounded-md">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Nav arrows */}
                  <button
                    onClick={() => setActiveImg((p) => (p - 1 + gallery.length) % gallery.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[hsl(var(--cream))]/90 backdrop-blur flex items-center justify-center text-[hsl(var(--burgundy))] opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--charcoal))] transition-all duration-300 shadow-md"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((p) => (p + 1) % gallery.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[hsl(var(--cream))]/90 backdrop-blur flex items-center justify-center text-[hsl(var(--burgundy))] opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--charcoal))] transition-all duration-300 shadow-md"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Zoom */}
                  <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                    <DialogTrigger asChild>
                      <button
                        aria-label="Zoom image"
                        className="absolute bottom-4 right-4 z-10 w-11 h-11 rounded-full bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] flex items-center justify-center shadow-lg hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--charcoal))] transition-all duration-300"
                      >
                        <ZoomIn size={16} />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl p-0 bg-[hsl(var(--charcoal))] border-0 overflow-hidden">
                      <div className="relative w-full h-[80vh]">
                        <img src={gallery[activeImg]} alt={product.name} className="w-full h-full object-contain" />
                        <button
                          onClick={() => setZoomOpen(false)}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[hsl(var(--cream))]/15 backdrop-blur text-[hsl(var(--cream))] flex items-center justify-center hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--charcoal))] transition-colors"
                          aria-label="Close"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Pagination dots (mobile) */}
                <div className="flex lg:hidden justify-center gap-1.5 mt-3">
                  {gallery.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImg === i ? 'w-6 bg-[hsl(var(--burgundy))]' : 'w-1.5 bg-[hsl(var(--burgundy)/0.25)]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============ INFO ============ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Brand + category */}
            <div className="flex items-center gap-3 mb-3 text-[11px] tracking-[0.3em] uppercase font-body text-[hsl(var(--burgundy))]">
              <span className="font-semibold">Delilar</span>
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))]" />
              <span className="capitalize text-muted-foreground">{product.category}</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-heading font-bold text-[hsl(var(--charcoal))] leading-[1.1] mb-3">
              {product.name}
            </h1>
            <p className="text-sm font-body italic text-muted-foreground mb-5">
              Crafted with care — a Sunnah-inspired piece of timeless elegance.
            </p>

            {/* Rating row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 pb-6 border-b border-[hsl(var(--burgundy)/0.12)]">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]' : 'text-border'}
                    />
                  ))}
                </div>
                <span className="text-sm font-body font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                <a href="#reviews" className="text-xs font-body text-muted-foreground hover:text-[hsl(var(--burgundy))] underline-offset-4 hover:underline">
                  ({product.reviews} reviews)
                </a>
              </div>
              <span className="text-xs font-body text-muted-foreground flex items-center gap-1.5">
                <Package size={13} className="text-[hsl(var(--gold))]" /> {soldCount}+ sold
              </span>
              <span className="text-xs font-body text-muted-foreground">SKU: <span className="text-foreground">{sku}</span></span>
            </div>

            {/* Price */}
            <div className="flex items-baseline flex-wrap gap-3 mb-3">
              <span className="text-4xl font-heading font-bold text-[hsl(var(--burgundy))]">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through font-body">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-body bg-[hsl(var(--gold)/0.2)] text-[hsl(var(--burgundy))] px-2.5 py-1 rounded-md font-semibold tracking-wide">
                    Save ৳{(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs font-body text-muted-foreground mb-6">
              Inclusive of VAT. Free shipping on orders over ৳5,000.
            </p>

            {/* Stock badge */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="inline-flex items-center gap-2 text-xs font-body text-green-700 bg-green-500/10 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  In Stock — Ready to ship
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs font-body text-destructive bg-destructive/10 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Currently Unavailable
                </span>
              )}
            </div>

            <p className="text-sm font-body text-muted-foreground leading-relaxed mb-7">
              {product.description}
            </p>

            {/* Color swatches (preferred when variants exist) */}
            {product.colorVariants && product.colorVariants.length > 0 ? (
              <div className="mb-6">
                <p className="text-xs font-body tracking-[0.25em] uppercase mb-3 font-semibold text-foreground">
                  Color {selectedColor && <span className="text-muted-foreground font-normal normal-case tracking-normal">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colorVariants.map((cv) => (
                    <button
                      key={cv.name}
                      onClick={() => setSelectedColor(cv.name)}
                      aria-label={cv.name}
                      title={cv.name}
                      className={`relative w-11 h-11 rounded-full transition-all duration-300 ${
                        selectedColor === cv.name
                          ? 'ring-2 ring-offset-2 ring-[hsl(var(--burgundy))] ring-offset-[hsl(var(--cream))] scale-110'
                          : 'ring-1 ring-[hsl(var(--burgundy)/0.2)] hover:scale-105'
                      }`}
                      style={{ backgroundColor: cv.hex }}
                    />
                  ))}
                </div>
              </div>
            ) : product.colors ? (
              <VariantGroup
                label="Color"
                options={product.colors}
                selected={selectedColor}
                onSelect={setSelectedColor}
              />
            ) : null}

            {/* Sizes (clothing only) */}
            {product.sizes && product.productType === 'clothing' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-body tracking-[0.25em] uppercase font-semibold text-foreground">Size</p>
                  <SizeGuideDialog category={product.category} unit={unit} setUnit={setUnit} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[52px] h-12 px-4 rounded-xl text-sm font-body font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? 'bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] shadow-[0_8px_24px_-8px_hsl(var(--burgundy)/0.6)] scale-[1.03]'
                          : 'bg-[hsl(var(--cream))] border border-[hsl(var(--burgundy)/0.18)] text-foreground hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--burgundy))]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Volume (perfume / attar) */}
            {product.volumeOptions && product.volumeOptions.length > 0 && (
              <VariantGroup
                label="Volume"
                options={product.volumeOptions}
                selected={selectedVolume}
                onSelect={setSelectedVolume}
                icon={<Sparkles size={12} className="text-[hsl(var(--gold))]" />}
              />
            )}

            {/* Fabric (clothing only, optional) */}
            {product.fabric && product.fabric.length > 1 && (
              <VariantGroup
                label="Fabric"
                options={product.fabric}
                selected={selectedFabric}
                onSelect={setSelectedFabric}
              />
            )}

            {/* Fragrance notes pyramid (perfume) */}
            {product.fragranceNotes && (
              <div className="mb-6 rounded-2xl bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] p-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))] mb-4 font-body">Fragrance Pyramid</p>
                <div className="space-y-3 text-sm font-body">
                  <NoteRow label="Top" notes={product.fragranceNotes.top} />
                  <NoteRow label="Heart" notes={product.fragranceNotes.heart} />
                  <NoteRow label="Base" notes={product.fragranceNotes.base} />
                </div>
                {(product.longevity || product.projection) && (
                  <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-[hsl(var(--gold)/0.25)]">
                    {product.longevity && (
                      <div>
                        <p className="text-[10px] tracking-[0.25em] uppercase text-[hsl(var(--gold))] mb-1">Longevity</p>
                        <p className="text-sm font-body">{product.longevity}</p>
                      </div>
                    )}
                    {product.projection && (
                      <div>
                        <p className="text-[10px] tracking-[0.25em] uppercase text-[hsl(var(--gold))] mb-1">Projection</p>
                        <p className="text-sm font-body">{product.projection}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Material card (accessories) */}
            {product.productType === 'accessories' && product.material && (
              <div className="mb-6 rounded-2xl bg-[hsl(var(--cream))] border border-[hsl(var(--burgundy)/0.12)] p-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--burgundy))] mb-1 font-body">Material</p>
                <p className="text-sm font-body text-foreground">{product.material}</p>
              </div>
            )}


            {/* Quantity + Actions */}
            <div className="flex items-stretch gap-3 mb-3">
              <div className="flex items-center rounded-xl border border-[hsl(var(--burgundy)/0.2)] bg-[hsl(var(--cream))] overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="w-12 h-14 flex items-center justify-center text-[hsl(var(--burgundy))] hover:bg-[hsl(var(--burgundy))] hover:text-[hsl(var(--cream))] transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center text-base font-body font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  className="w-12 h-14 flex items-center justify-center text-[hsl(var(--burgundy))] hover:bg-[hsl(var(--burgundy))] hover:text-[hsl(var(--cream))] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAddToCart(false)}
                disabled={!product.inStock || adding}
                className="flex-1 h-14 rounded-xl bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] text-sm font-body tracking-[0.2em] uppercase font-semibold shadow-[0_10px_30px_-10px_hsl(var(--burgundy)/0.6)] hover:bg-[hsl(var(--burgundy-light))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {adding ? 'Adding…' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </motion.button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddToCart(true)}
              disabled={!product.inStock}
              className="w-full h-14 rounded-xl bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] text-sm font-body tracking-[0.2em] uppercase font-bold shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.7)] hover:bg-[hsl(var(--gold-dark))] hover:text-[hsl(var(--cream))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mb-4"
            >
              Buy Now
            </motion.button>

            {/* Secondary actions */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => toggleWish(product)}
                className={`flex items-center gap-2 px-4 h-11 text-xs font-body tracking-wide uppercase rounded-xl transition-all duration-300 ${
                  hasWish(product.id)
                    ? 'bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] border border-[hsl(var(--burgundy))]'
                    : 'bg-[hsl(var(--cream))] text-foreground border border-[hsl(var(--burgundy)/0.18)] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--burgundy))]'
                }`}
              >
                <Heart size={14} className={hasWish(product.id) ? 'fill-current' : ''} />
                {hasWish(product.id) ? 'Wishlisted' : 'Wishlist'}
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-4 h-11 text-xs font-body tracking-wide uppercase rounded-xl bg-[hsl(var(--cream))] text-foreground border border-[hsl(var(--burgundy)/0.18)] hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--burgundy))] transition-all duration-300">
                    <Share2 size={14} /> Share
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-sm bg-[hsl(var(--cream))] border-[hsl(var(--burgundy)/0.15)]">
                  <h3 className="text-lg font-heading font-bold mb-4">Share this product</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: Copy, label: 'Copy', action: () => handleShare('copy') },
                      { icon: Facebook, label: 'Facebook', action: () => handleShare('fb') },
                      { icon: Twitter, label: 'Twitter', action: () => handleShare('tw') },
                      { icon: MessageCircle, label: 'WhatsApp', action: () => handleShare('wa') },
                    ].map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[hsl(var(--burgundy)/0.15)] hover:bg-[hsl(var(--burgundy))] hover:text-[hsl(var(--cream))] transition-colors group"
                      >
                        <Icon size={18} />
                        <span className="text-[10px] font-body uppercase tracking-wider">{label}</span>
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Delivery info card */}
            <div className="rounded-2xl bg-[hsl(var(--cream))] border border-[hsl(var(--burgundy)/0.12)] p-5 mb-6 space-y-4">
              <DeliveryRow icon={MapPin} title="Delivers across Bangladesh" sub="Inside Dhaka: 1–2 days · Outside Dhaka: 3–5 days" />
              <DeliveryRow icon={CreditCard} title="Cash on Delivery available" sub="Pay when you receive your order" />
              <DeliveryRow icon={Clock} title="Order today, ships tomorrow" sub="Same-day dispatch for orders before 5 PM" />
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: BadgeCheck, text: '100% Authentic' },
                { icon: Truck, text: 'Fast Delivery' },
                { icon: RotateCcw, text: '7-Day Returns' },
                { icon: Headphones, text: '24/7 Support' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--burgundy)/0.04)] border border-[hsl(var(--burgundy)/0.08)]">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(var(--burgundy))] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[hsl(var(--gold))]" />
                  </div>
                  <span className="text-xs font-body font-medium text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ============ DETAILS ACCORDION ============ */}
        <section className="mt-16 lg:mt-24 max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-[hsl(var(--charcoal))] mb-6 text-center">
            Product Details
          </h2>
          <Accordion type="multiple" defaultValue={['desc']} className="bg-[hsl(var(--cream))] rounded-2xl border border-[hsl(var(--burgundy)/0.12)] divide-y divide-[hsl(var(--burgundy)/0.08)] overflow-hidden">
            <DetailItem value="desc" title="Description">
              <p className="text-sm font-body leading-relaxed text-muted-foreground">{product.description}</p>
              <p className="text-sm font-body leading-relaxed text-muted-foreground mt-3">
                Each Delilar piece is meticulously selected to embody modesty, refinement, and modern Islamic elegance.
                Crafted with premium materials and timeless detailing for the discerning gentleman.
              </p>
            </DetailItem>
            <DetailItem value="material" title="Fabric & Material">
              <ul className="text-sm font-body text-muted-foreground space-y-2 list-disc pl-5">
                <li>Premium-grade, breathable fabric with a soft hand-feel</li>
                <li>Reinforced stitching for long-lasting durability</li>
                <li>Pre-shrunk and color-locked finish</li>
                <li>Made in small batches for quality assurance</li>
              </ul>
            </DetailItem>
            <DetailItem value="care" title="Care Instructions">
              <ul className="text-sm font-body text-muted-foreground space-y-2 list-disc pl-5">
                <li>Gentle machine wash cold with similar colors</li>
                <li>Do not bleach. Iron on low heat if needed</li>
                <li>Hang dry to preserve color and finish</li>
                <li>Store in a cool, dry place</li>
              </ul>
            </DetailItem>
            <DetailItem value="shipping" title="Shipping Information">
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                We ship nationwide via trusted couriers. Inside Dhaka: 1–2 business days. Outside Dhaka: 3–5 business days.
                Free shipping on all orders over ৳5,000. Track your order anytime from your Delilar account.
              </p>
            </DetailItem>
            <DetailItem value="returns" title="Return & Exchange Policy">
              <p className="text-sm font-body text-muted-foreground leading-relaxed">
                Not the right fit? Return or exchange within 7 days of delivery — unworn, with original tags and packaging.
                Refunds are processed within 3–5 business days after inspection.
              </p>
            </DetailItem>
            <DetailItem value="faq" title="FAQs">
              <div className="space-y-4 text-sm font-body text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Is the color shown accurate?</p>
                  <p>Colors are shot in natural light and may vary slightly on different screens.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Do you offer cash on delivery?</p>
                  <p>Yes, COD is available across Bangladesh along with secure online payment.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">How do I track my order?</p>
                  <p>Visit your Delilar account dashboard for real-time order tracking.</p>
                </div>
              </div>
            </DetailItem>
          </Accordion>
        </section>

        {/* ============ REVIEWS ============ */}
        <section id="reviews" className="mt-16 lg:mt-24 max-w-5xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-heading font-bold text-[hsl(var(--charcoal))] mb-8 text-center">
            Customer Reviews
          </h2>

          <div className="grid md:grid-cols-[280px_1fr] gap-8 bg-[hsl(var(--cream))] rounded-2xl border border-[hsl(var(--burgundy)/0.12)] p-6 lg:p-8 mb-8">
            {/* Average */}
            <div className="text-center md:text-left md:border-r md:pr-8 border-[hsl(var(--burgundy)/0.1)]">
              <p className="text-5xl font-heading font-bold text-[hsl(var(--burgundy))]">{product.rating.toFixed(1)}</p>
              <div className="flex justify-center md:justify-start gap-0.5 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]' : 'text-border'}
                  />
                ))}
              </div>
              <p className="text-xs font-body text-muted-foreground mb-5">Based on {product.reviews} reviews</p>
              <button className="text-xs font-body tracking-[0.2em] uppercase px-5 py-3 rounded-xl bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] hover:bg-[hsl(var(--burgundy-light))] transition-colors w-full">
                Write a review
              </button>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 self-center">
              {breakdown.map(({ stars, count }) => {
                const pct = product.reviews > 0 ? (count / product.reviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-body">
                    <span className="w-10 text-muted-foreground">{stars} star</span>
                    <div className="flex-1 h-2 rounded-full bg-[hsl(var(--burgundy)/0.08)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))]"
                      />
                    </div>
                    <span className="w-10 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {sampleReviews.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-[hsl(var(--cream))] border border-[hsl(var(--burgundy)/0.12)] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] flex items-center justify-center text-sm font-heading font-bold">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-body font-semibold text-foreground">{r.name}</p>
                      <p className="text-[11px] font-body text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-body uppercase tracking-wider text-green-700 bg-green-500/10 px-2 py-1 rounded">
                      <BadgeCheck size={11} /> Verified
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={12} className={j < r.rating ? 'fill-[hsl(var(--gold))] text-[hsl(var(--gold))]' : 'text-border'} />
                  ))}
                </div>
                <p className="text-sm font-body font-semibold text-foreground mb-1">{r.title}</p>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{r.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ RELATED ============ */}
        {related.length > 0 && (
          <section className="mt-20 lg:mt-28">
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-[0.3em] uppercase font-body text-[hsl(var(--gold))] mb-2">Curated for you</p>
              <h2 className="text-2xl lg:text-4xl font-heading font-bold text-[hsl(var(--charcoal))]">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ============ STICKY MOBILE PURCHASE BAR ============ */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[hsl(var(--cream))]/95 backdrop-blur-xl border-t border-[hsl(var(--burgundy)/0.15)] p-3 shadow-[0_-10px_30px_-10px_hsl(var(--burgundy)/0.25)]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">Price</p>
            <p className="text-lg font-heading font-bold text-[hsl(var(--burgundy))] leading-tight">৳{(product.price * quantity).toLocaleString()}</p>
          </div>
          <button
            onClick={() => handleAddToCart(false)}
            disabled={!product.inStock}
            className="flex-1 h-12 rounded-xl bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] text-xs font-body tracking-widest uppercase font-semibold disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            onClick={() => handleAddToCart(true)}
            disabled={!product.inStock}
            className="flex-1 h-12 rounded-xl bg-[hsl(var(--gold))] text-[hsl(var(--charcoal))] text-xs font-body tracking-widest uppercase font-bold disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
};

/* ===================== Sub-components ===================== */

const VariantGroup = ({
  label,
  options,
  selected,
  onSelect,
  icon,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  icon?: React.ReactNode;
}) => (
  <div className="mb-6">
    <p className="text-xs font-body tracking-[0.25em] uppercase mb-3 font-semibold text-foreground flex items-center gap-2">
      {icon}
      {label}
      {selected && <span className="text-muted-foreground font-normal normal-case tracking-normal">— {selected}</span>}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-5 h-11 rounded-xl text-sm font-body transition-all duration-300 ${
            selected === opt
              ? 'bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))] shadow-[0_8px_24px_-8px_hsl(var(--burgundy)/0.6)] scale-[1.03]'
              : 'bg-[hsl(var(--cream))] border border-[hsl(var(--burgundy)/0.18)] text-foreground hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--burgundy))]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const DeliveryRow = ({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--burgundy))] flex items-center justify-center shrink-0">
      <Icon size={15} className="text-[hsl(var(--gold))]" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-body font-semibold text-foreground">{title}</p>
      <p className="text-xs font-body text-muted-foreground leading-relaxed">{sub}</p>
    </div>
  </div>
);

const DetailItem = ({ value, title, children }: { value: string; title: string; children: React.ReactNode }) => (
  <AccordionItem value={value} className="border-0 px-5 lg:px-7">
    <AccordionTrigger className="text-base font-heading font-semibold text-[hsl(var(--charcoal))] hover:no-underline py-5">
      {title}
    </AccordionTrigger>
    <AccordionContent className="pb-5">{children}</AccordionContent>
  </AccordionItem>
);

const NoteRow = ({ label, notes }: { label: string; notes: string[] }) => (
  <div className="flex items-start gap-3">
    <span className="text-[10px] tracking-[0.25em] uppercase text-[hsl(var(--gold))] w-12 shrink-0 pt-0.5">{label}</span>
    <span className="text-sm font-body text-[hsl(var(--cream))]">{notes.join(' · ')}</span>
  </div>
);

const SizeGuideDialog = ({
  category,
  unit,
  setUnit,
}: {
  category: Product['category'];
  unit: 'in' | 'cm';
  setUnit: (u: 'in' | 'cm') => void;
}) => {
  const isThobe = category === 'jubba' || category === 'eid';
  const isPanjabi = category === 'panjabi';
  const isPants = category === 'pants';

  // inches base data
  const rowsIn = isThobe
    ? [
        ['S', '40', '17', '56'],
        ['M', '42', '18', '57'],
        ['L', '44', '19', '58'],
        ['XL', '46', '19.5', '59'],
        ['2XL', '48', '20', '60'],
        ['3XL', '50', '20.5', '61'],
      ]
    : isPanjabi
    ? [
        ['S', '38', '17', '38'],
        ['M', '40', '17.5', '39'],
        ['L', '42', '18', '40'],
        ['XL', '44', '18.5', '41'],
        ['2XL', '46', '19', '42'],
      ]
    : isPants
    ? [
        ['28', '28', '38', '40'],
        ['30', '30', '40', '40.5'],
        ['32', '32', '42', '41'],
        ['34', '34', '44', '41.5'],
        ['36', '36', '46', '42'],
        ['38', '38', '48', '42.5'],
      ]
    : [
        ['XS', '34–36', '26–28', '25'],
        ['S', '36–38', '28–30', '26'],
        ['M', '38–40', '30–32', '27'],
        ['L', '40–42', '32–34', '28'],
        ['XL', '42–44', '34–36', '29'],
        ['2XL', '44–46', '36–38', '30'],
        ['3XL', '46–48', '38–40', '31'],
      ];

  const headers = isThobe
    ? ['Size', 'Chest', 'Shoulder', 'Length']
    : isPanjabi
    ? ['Size', 'Chest', 'Shoulder', 'Length']
    : isPants
    ? ['Size', 'Waist', 'Hip', 'Length']
    : ['Size', 'Chest', 'Waist', 'Length'];

  const toCm = (v: string) => {
    // single number or range "x–y"
    const conv = (n: string) => (Number.isFinite(+n) ? Math.round(+n * 2.54).toString() : n);
    if (v.includes('–')) {
      return v.split('–').map(conv).join('–');
    }
    return Number.isFinite(+v) ? conv(v) : v;
  };

  const rows = rowsIn.map((r) => [r[0], ...r.slice(1).map((cell) => (unit === 'cm' ? toCm(cell) : cell))]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-[11px] font-body tracking-wider uppercase text-[hsl(var(--burgundy))] hover:text-[hsl(var(--gold-dark))] transition-colors">
          <Ruler size={12} /> Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-[hsl(var(--cream))] border-[hsl(var(--burgundy)/0.15)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-heading font-bold text-[hsl(var(--charcoal))]">Size Guide</h3>
          <div className="flex rounded-full bg-[hsl(var(--burgundy)/0.08)] p-1">
            {(['in', 'cm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-3 py-1 text-[11px] font-body tracking-wider uppercase rounded-full transition-all ${
                  unit === u
                    ? 'bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))]'
                    : 'text-[hsl(var(--burgundy))]'
                }`}
              >
                {u === 'in' ? 'Inches' : 'CM'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs font-body text-muted-foreground mb-5">
          All measurements in {unit === 'in' ? 'inches' : 'centimeters'}. Body measurements, not garment.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[hsl(var(--burgundy)/0.12)]">
          <table className="w-full text-sm font-body">
            <thead className="bg-[hsl(var(--burgundy))] text-[hsl(var(--cream))]">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-[hsl(var(--cream))]' : 'bg-[hsl(var(--cream-dark))]'}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-foreground">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs font-body text-muted-foreground mt-4">
          Tip: For a relaxed fit, choose one size up. Contact us if you need help selecting your size.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
