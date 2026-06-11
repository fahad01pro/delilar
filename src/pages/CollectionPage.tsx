import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { useCampaignBySlug, resolveCampaignProducts, isCampaignLive } from '@/hooks/useCampaigns';
import { useCatalog } from '@/hooks/useCatalog';
import { resolveImage } from '@/lib/imageAssets';
import ProductCard from '@/components/ProductCard';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, isLoading } = useCampaignBySlug(slug);
  const { data: catalog = [] } = useCatalog();
  const [sort, setSort] = useState<SortKey>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const products = useMemo(() => {
    if (!campaign) return [];
    let list = resolveCampaignProducts(campaign, catalog);
    if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
    switch (sort) {
      case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'newest': list = [...list].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); break;
    }
    return list;
  }, [campaign, catalog, sort, maxPrice]);

  if (isLoading) {
    return <main className="container mx-auto px-4 py-20 text-center font-body text-muted-foreground">Loading collection…</main>;
  }
  if (!campaign) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl mb-3">Collection not found</h1>
        <p className="text-muted-foreground font-body mb-6">This campaign may have ended or been removed.</p>
        <Link to="/" className="text-accent font-body underline">Return home</Link>
      </main>
    );
  }
  if (!isCampaignLive(campaign)) {
    return (
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl mb-3">{campaign.title}</h1>
        <p className="text-muted-foreground font-body">This collection is not currently available.</p>
      </main>
    );
  }

  const banner = campaign.banner_url ? resolveImage(campaign.banner_url) : undefined;
  const mobileBanner = campaign.mobile_banner_url ? resolveImage(campaign.mobile_banner_url) : banner;

  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[420px] md:h-[520px] lg:h-[620px]">
          {banner ? (
            <picture>
              <source media="(min-width: 768px)" srcSet={banner} />
              <img src={mobileBanner} alt={campaign.title} className="absolute inset-0 w-full h-full object-cover" />
            </picture>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

          <div className="absolute inset-0 flex items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="container mx-auto px-6 lg:px-10 pb-14 lg:pb-20 max-w-3xl text-primary-foreground"
            >
              {campaign.eyebrow && (
                <p className="text-[11px] font-body tracking-[0.32em] uppercase text-accent mb-4">{campaign.eyebrow}</p>
              )}
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                {campaign.headline || campaign.title}
              </h1>
              {campaign.subheading && (
                <p className="text-base md:text-lg font-body text-primary-foreground/85 mb-6 max-w-2xl">
                  {campaign.subheading}
                </p>
              )}
              {campaign.cta_label && campaign.cta_href && (
                <Link
                  to={campaign.cta_href}
                  className="inline-flex items-center gap-2 bg-accent text-foreground px-7 py-3 text-xs font-body tracking-[0.18em] uppercase font-semibold rounded-xl hover:shadow-[0_0_24px_hsl(43_72%_52%/0.45)] transition-all duration-300"
                >
                  {campaign.cta_label} <ArrowRight size={15} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description */}
      {campaign.description && (
        <section className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl text-center">
          <p className="font-body text-foreground/80 leading-relaxed whitespace-pre-line">{campaign.description}</p>
        </section>
      )}

      {/* Filters + Grid */}
      <section className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground font-body">{products.length} products</p>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-xs font-body tracking-wider uppercase border border-border rounded-xl px-3 py-2 bg-background"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
            </select>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 text-xs font-body tracking-wider uppercase px-4 py-2 rounded-xl border border-border hover:border-primary hover:bg-primary/5"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 p-5 glass rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-body tracking-widest uppercase">Max Price</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg hover:bg-secondary"><X size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[null, 2000, 4000, 8000].map((v, i) => (
                <button
                  key={i}
                  onClick={() => setMaxPrice(v)}
                  className={`px-5 py-2.5 text-xs font-body tracking-wider rounded-xl border transition-all ${
                    maxPrice === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                  }`}
                >
                  {v === null ? 'All' : `Under ৳${v.toLocaleString()}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-body">No products in this collection yet.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default CollectionPage;
