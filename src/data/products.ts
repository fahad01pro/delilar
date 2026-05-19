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

export type CategorySlug =
  | 'jubba'
  | 'panjabi'
  | 'tshirts'
  | 'polo'
  | 'shirts'
  | 'pants'
  | 'hoodies'
  | 'caps'
  | 'bags'
  | 'wallets'
  | 'kuffiyah'
  | 'turban'
  | 'perfume'
  | 'attar'
  | 'eid'
  | 'accessories';

export type ProductType = 'clothing' | 'accessories' | 'perfume';

export interface ColorVariant {
  name: string;
  hex?: string;
  images: string[]; // typically 2 per variant
}

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: CategorySlug;
  productType: ProductType;
  subcategory?: string;
  image: string;
  images?: string[];
  description: string;
  sizes?: string[];
  colors?: string[]; // legacy/simple list
  colorVariants?: ColorVariant[]; // preferred — drives image swapping
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  tags?: string[];

  // Merchandising flags (mirrored from DB columns)
  createdAt?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  soldCount?: number;
  newUntil?: string; // optional admin-extended ISO date

  // Clothing
  fabric?: string[];
  careInstructions?: string[];
  fitType?: string;

  // Accessories
  material?: string;

  // Perfume / Attar
  fragranceNotes?: FragranceNotes;
  longevity?: string;
  projection?: string;
  volumeOptions?: string[];
  usageGuide?: string;

  // Admin-editable rich info sections (markdown-lite). Auto-defaulted on create.
  infoSections?: {
    fabric?: string;
    care?: string;
    shipping?: string;
    returns?: string;
    faqs?: string;
  };
}

/* ---------- Helpers to keep records terse ---------- */
const clothingCare = [
  'Gentle machine wash cold with similar colors',
  'Do not bleach. Iron on low heat',
  'Hang dry to preserve color and finish',
  'Store folded in a cool, dry place',
];

const accessoryCare = [
  'Wipe clean with a soft dry cloth',
  'Keep away from moisture and direct sunlight',
  'Use leather conditioner periodically (for leather goods)',
];

/* Color hex map for visual swatches */
const COLOR: Record<string, string> = {
  White: '#F8F4EE',
  'Off-White': '#EFE7DA',
  Cream: '#F1E6D2',
  Black: '#111111',
  Charcoal: '#2B2B2B',
  Navy: '#1A2240',
  'Royal Blue': '#1F3DA6',
  Burgundy: '#4B0F1C',
  Maroon: '#5C1A24',
  Olive: '#5B6235',
  Sage: '#A8B79A',
  Gold: '#C9A24A',
  Beige: '#D6C2A2',
  Brown: '#5C3A21',
  Tan: '#A98763',
  Red: '#A11D2A',
  Grey: '#7A7A7A',
  Mint: '#B9DCC4',
};

const c = (name: string, images: string[]): ColorVariant => ({
  name,
  hex: COLOR[name] || '#888',
  images,
});

/* ---------- Catalog ---------- */
export const products: Product[] = [
  /* ===================== JUBBA / THOBE ===================== */
  {
    id: 'jb-001',
    name: 'Royal Emirati Thobe',
    price: 4990,
    originalPrice: 5990,
    category: 'jubba',
    productType: 'clothing',
    image: jubbaImg,
    description:
      'Hand-finished Emirati-style thobe with mandarin collar and concealed placket. Tailored in premium cotton blend for a clean, regal drape.',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colorVariants: [
      c('White', [jubbaImg, panjabiImg]),
      c('Cream', [panjabiImg, jubbaImg]),
      c('Black', [streetwearImg, jubbaImg]),
    ],
    rating: 4.9,
    reviews: 203,
    badge: 'Best Seller',
    inStock: true,
    fabric: ['Premium Cotton Blend', 'Soft Linen Mix'],
    careInstructions: clothingCare,
    fitType: 'Regular fit · flowing silhouette',
    tags: ['emirati', 'thobe', 'jubba'],
  },
  {
    id: 'jb-002',
    name: 'Moroccan Designer Jubba',
    price: 5490,
    category: 'jubba',
    productType: 'clothing',
    image: jubbaImg,
    description:
      'Moroccan-inspired jubba with intricate collar embroidery. Architectural silhouette with subtle gold-tone fastenings.',
    sizes: ['M', 'L', 'XL', '2XL'],
    colorVariants: [
      c('Black', [jubbaImg, streetwearImg]),
      c('Charcoal', [streetwearImg, jubbaImg]),
      c('Navy', [jubbaImg, panjabiImg]),
    ],
    rating: 4.8,
    reviews: 156,
    badge: 'Premium',
    inStock: true,
    fabric: ['Pure Cotton', 'Wool Blend'],
    careInstructions: clothingCare,
    fitType: 'Tailored fit',
  },
  {
    id: 'jb-003',
    name: 'Saudi Classic Thobe',
    price: 4490,
    category: 'jubba',
    productType: 'clothing',
    image: jubbaImg,
    description: 'Daily-wear Saudi-style thobe with clean lines. Lightweight, breathable, and effortless.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colorVariants: [c('Cream', [jubbaImg, panjabiImg]), c('Beige', [panjabiImg, jubbaImg])],
    rating: 4.7,
    reviews: 98,
    inStock: true,
    fabric: ['Cotton'],
    careInstructions: clothingCare,
    fitType: 'Relaxed fit',
  },

  /* ===================== PANJABI ===================== */
  {
    id: 'pj-001',
    name: 'Golden Silk Panjabi',
    price: 3990,
    originalPrice: 4990,
    category: 'panjabi',
    productType: 'clothing',
    image: panjabiImg,
    description: 'Luxurious silk panjabi with golden thread embroidery on collar and placket — for weddings and Eid.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colorVariants: [c('Gold', [panjabiImg, jubbaImg]), c('Cream', [jubbaImg, panjabiImg])],
    rating: 4.9,
    reviews: 187,
    badge: 'Best Seller',
    inStock: true,
    fabric: ['Pure Silk', 'Semi-Silk'],
    careInstructions: ['Dry clean only', 'Iron on silk setting with a cloth in between', 'Store on padded hanger'],
    fitType: 'Tailored fit',
  },
  {
    id: 'pj-002',
    name: 'Embroidered Navy Panjabi',
    price: 3490,
    category: 'panjabi',
    productType: 'clothing',
    image: panjabiImg,
    description: 'Hand-embroidered navy panjabi with refined cuff detailing. Tradition meets modern restraint.',
    sizes: ['M', 'L', 'XL', '2XL'],
    colorVariants: [c('Navy', [panjabiImg, jubbaImg]), c('Black', [jubbaImg, panjabiImg])],
    rating: 4.7,
    reviews: 91,
    badge: 'New',
    inStock: true,
    fabric: ['Cotton', 'Semi-Silk'],
    careInstructions: clothingCare,
    fitType: 'Regular fit',
  },
  {
    id: 'pj-003',
    name: 'Sage Semi-Silk Panjabi',
    price: 3290,
    category: 'panjabi',
    productType: 'clothing',
    image: panjabiImg,
    description: 'Lightweight semi-silk panjabi in calm sage. Soft drape, perfect for semi-formal evenings.',
    sizes: ['S', 'M', 'L', 'XL'],
    colorVariants: [c('Sage', [panjabiImg, jubbaImg]), c('Mint', [panjabiImg, jubbaImg])],
    rating: 4.5,
    reviews: 56,
    inStock: true,
    fabric: ['Semi-Silk'],
    careInstructions: clothingCare,
    fitType: 'Regular fit',
  },

  /* ===================== T-SHIRTS ===================== */
  {
    id: 'ts-001',
    name: 'Essential Premium Tee',
    price: 1290,
    originalPrice: 1590,
    category: 'tshirts',
    productType: 'clothing',
    image: tshirtImg,
    description: 'Heavyweight 240gsm cotton crew. Tailored shoulder, clean neckline, built to last.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colorVariants: [
      c('Black', [tshirtImg, streetwearImg]),
      c('White', [tshirtImg, panjabiImg]),
      c('Burgundy', [streetwearImg, tshirtImg]),
    ],
    rating: 4.8,
    reviews: 124,
    badge: 'Best Seller',
    inStock: true,
    fabric: ['100% Premium Cotton'],
    careInstructions: clothingCare,
    fitType: 'Regular fit',
  },
  {
    id: 'ts-002',
    name: 'Charcoal Henley Tee',
    price: 1490,
    category: 'tshirts',
    productType: 'clothing',
    image: tshirtImg,
    description: 'Three-button henley in soft slub cotton. Effortless layering piece.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colorVariants: [
      c('Charcoal', [tshirtImg, streetwearImg]),
      c('Olive', [streetwearImg, tshirtImg]),
    ],
    rating: 4.7,
    reviews: 67,
    badge: 'New',
    inStock: true,
    fabric: ['Slub Cotton'],
    careInstructions: clothingCare,
    fitType: 'Slim fit',
  },

  /* ===================== POLO ===================== */
  {
    id: 'po-001',
    name: 'Pique Burgundy Polo',
    price: 1890,
    originalPrice: 2290,
    category: 'polo',
    productType: 'clothing',
    image: poloImg,
    description: 'Classic pique polo with mother-of-pearl buttons and ribbed collar. A wardrobe staple, refined.',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colorVariants: [
      c('Burgundy', [poloImg, tshirtImg]),
      c('Black', [tshirtImg, poloImg]),
      c('Navy', [poloImg, panjabiImg]),
    ],
    rating: 4.8,
    reviews: 142,
    badge: 'Best Seller',
    inStock: true,
    fabric: ['Cotton Pique'],
    careInstructions: clothingCare,
    fitType: 'Regular fit',
  },
  {
    id: 'po-002',
    name: 'Tipped Collar Polo',
    price: 1990,
    category: 'polo',
    productType: 'clothing',
    image: poloImg,
    description: 'Contrast-tipped collar polo with a sharp silhouette. Refined casual elegance.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colorVariants: [c('White', [poloImg, tshirtImg]), c('Charcoal', [poloImg, streetwearImg])],
    rating: 4.6,
    reviews: 78,
    inStock: true,
    fabric: ['Cotton Pique', 'Bamboo Blend'],
    careInstructions: clothingCare,
    fitType: 'Slim fit',
  },

  /* ===================== SHIRTS ===================== */
  {
    id: 'sh-001',
    name: 'Oxford Twill Shirt',
    price: 2290,
    originalPrice: 2790,
    category: 'shirts',
    productType: 'clothing',
    image: poloImg,
    description: 'Premium oxford twill button-down. Crisp finish with a soft hand-feel.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colorVariants: [
      c('White', [poloImg, panjabiImg]),
      c('Navy', [poloImg, jubbaImg]),
      c('Burgundy', [poloImg, streetwearImg]),
    ],
    rating: 4.7,
    reviews: 96,
    badge: 'New',
    inStock: true,
    fabric: ['Oxford Cotton'],
    careInstructions: clothingCare,
    fitType: 'Tailored fit',
  },
  {
    id: 'sh-002',
    name: 'Linen Resort Shirt',
    price: 2590,
    category: 'shirts',
    productType: 'clothing',
    image: poloImg,
    description: 'Pure linen camp-collar shirt. Breathable, lived-in, effortlessly elegant.',
    sizes: ['S', 'M', 'L', 'XL'],
    colorVariants: [c('Beige', [poloImg, panjabiImg]), c('Olive', [poloImg, streetwearImg])],
    rating: 4.6,
    reviews: 54,
    inStock: true,
    fabric: ['Pure Linen'],
    careInstructions: ['Wash cold, gentle cycle', 'Iron on linen setting while slightly damp'],
    fitType: 'Relaxed fit',
  },

  /* ===================== PANTS ===================== */
  {
    id: 'pn-001',
    name: 'Tapered Twill Trouser',
    price: 2490,
    originalPrice: 2990,
    category: 'pants',
    productType: 'clothing',
    image: streetwearImg,
    description: 'Tapered cotton twill trouser with a clean break. Smart-casual perfection.',
    sizes: ['28', '30', '32', '34', '36', '38'],
    colorVariants: [
      c('Black', [streetwearImg, tshirtImg]),
      c('Charcoal', [streetwearImg, poloImg]),
      c('Beige', [streetwearImg, panjabiImg]),
    ],
    rating: 4.7,
    reviews: 88,
    badge: 'Best Seller',
    inStock: true,
    fabric: ['Cotton Twill'],
    careInstructions: clothingCare,
    fitType: 'Tapered fit',
  },
  {
    id: 'pn-002',
    name: 'Premium Cargo Pant',
    price: 2790,
    category: 'pants',
    productType: 'clothing',
    image: streetwearImg,
    description: 'Modern cargo with refined utility pockets. Built in mid-weight cotton.',
    sizes: ['30', '32', '34', '36', '38'],
    colorVariants: [c('Olive', [streetwearImg, tshirtImg]), c('Black', [streetwearImg, poloImg])],
    rating: 4.5,
    reviews: 41,
    inStock: true,
    fabric: ['Cotton'],
    careInstructions: clothingCare,
    fitType: 'Straight fit',
  },

  /* ===================== HOODIES ===================== */
  {
    id: 'hd-001',
    name: 'Heavyweight Burgundy Hoodie',
    price: 2990,
    originalPrice: 3490,
    category: 'hoodies',
    productType: 'clothing',
    image: streetwearImg,
    description: '420gsm brushed-back fleece hoodie with kangaroo pocket. Sculptural, warm, refined.',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colorVariants: [
      c('Burgundy', [streetwearImg, tshirtImg]),
      c('Black', [streetwearImg, poloImg]),
      c('Cream', [streetwearImg, panjabiImg]),
    ],
    rating: 4.8,
    reviews: 167,
    badge: 'Best Seller',
    inStock: true,
    fabric: ['Brushed Fleece'],
    careInstructions: clothingCare,
    fitType: 'Oversized fit',
  },

  /* ===================== CAPS ===================== */
  {
    id: 'cp-001',
    name: 'Hand-Stitched Kufi Cap',
    price: 790,
    originalPrice: 990,
    category: 'caps',
    productType: 'accessories',
    subcategory: 'cap',
    image: capsImg,
    description: 'Lightweight hand-stitched kufi prayer cap in breathable cotton. Crafted for comfort.',
    colorVariants: [
      c('White', [capsImg, jubbaImg]),
      c('Black', [capsImg, streetwearImg]),
      c('Navy', [capsImg, panjabiImg]),
    ],
    rating: 4.7,
    reviews: 234,
    badge: 'Best Seller',
    inStock: true,
    material: 'Premium Cotton',
    careInstructions: accessoryCare,
  },
  {
    id: 'cp-002',
    name: 'Embroidered Velvet Kufi',
    price: 1290,
    category: 'caps',
    productType: 'accessories',
    subcategory: 'cap',
    image: capsImg,
    description: 'Luxe velvet kufi with golden thread embroidery. Statement piece for special occasions.',
    colorVariants: [c('Burgundy', [capsImg, panjabiImg]), c('Black', [capsImg, streetwearImg])],
    rating: 4.8,
    reviews: 87,
    badge: 'Premium',
    inStock: true,
    material: 'Velvet · Gold thread',
    careInstructions: accessoryCare,
  },

  /* ===================== KUFFIYAH / KEFFIYEH ===================== */
  {
    id: 'kf-001',
    name: 'Classic Keffiyah — Red & White',
    price: 1290,
    category: 'kuffiyah',
    productType: 'accessories',
    subcategory: 'kuffiyah',
    image: capsImg,
    description: 'Traditional Palestinian-style keffiyah in premium cotton weave. Hand-fringed edges.',
    colorVariants: [
      c('Red', [capsImg, panjabiImg]),
      c('Black', [capsImg, streetwearImg]),
      c('White', [capsImg, jubbaImg]),
    ],
    rating: 4.6,
    reviews: 156,
    inStock: true,
    material: 'Cotton weave',
    careInstructions: accessoryCare,
  },

  /* ===================== TURBAN / PAGRI ===================== */
  {
    id: 'tb-001',
    name: 'Royal Imamah Turban',
    price: 2490,
    originalPrice: 2990,
    category: 'turban',
    productType: 'accessories',
    subcategory: 'turban',
    image: capsImg,
    description: 'Premium pre-wrapped imamah turban with golden trim. Majestic and ceremonial.',
    colorVariants: [
      c('White', [capsImg, jubbaImg]),
      c('Black', [capsImg, streetwearImg]),
      c('Gold', [capsImg, panjabiImg]),
    ],
    rating: 4.8,
    reviews: 67,
    badge: 'Premium',
    inStock: true,
    material: 'Premium Cotton · Gold trim',
    careInstructions: accessoryCare,
  },

  /* ===================== BAGS ===================== */
  {
    id: 'bg-001',
    name: 'Heritage Leather Crossbody',
    price: 3990,
    originalPrice: 4790,
    category: 'bags',
    productType: 'accessories',
    subcategory: 'bags',
    image: bagsImg,
    description: 'Full-grain leather crossbody with antique brass hardware. Hand-stitched in small batches.',
    colorVariants: [
      c('Burgundy', [bagsImg, streetwearImg]),
      c('Black', [bagsImg, capsImg]),
      c('Brown', [bagsImg, panjabiImg]),
    ],
    rating: 4.8,
    reviews: 56,
    badge: 'New',
    inStock: true,
    material: 'Full-grain leather',
    careInstructions: accessoryCare,
  },
  {
    id: 'bg-002',
    name: 'Atelier Tote Bag',
    price: 4490,
    category: 'bags',
    productType: 'accessories',
    subcategory: 'bags',
    image: bagsImg,
    description: 'Structured tote in vegetable-tanned leather. Roomy, refined, ages beautifully.',
    colorVariants: [c('Tan', [bagsImg, panjabiImg]), c('Black', [bagsImg, streetwearImg])],
    rating: 4.7,
    reviews: 38,
    inStock: true,
    material: 'Vegetable-tanned leather',
    careInstructions: accessoryCare,
  },

  /* ===================== WALLETS ===================== */
  {
    id: 'wl-001',
    name: 'Bifold Leather Wallet',
    price: 1890,
    category: 'wallets',
    productType: 'accessories',
    subcategory: 'wallets',
    image: bagsImg,
    description: 'Hand-stitched bifold with RFID-protected card slots. Slim, sturdy, considered.',
    colorVariants: [
      c('Burgundy', [bagsImg, capsImg]),
      c('Black', [bagsImg, streetwearImg]),
      c('Brown', [bagsImg, panjabiImg]),
    ],
    rating: 4.7,
    reviews: 92,
    badge: 'Best Seller',
    inStock: true,
    material: 'Full-grain leather · RFID lining',
    careInstructions: accessoryCare,
  },
  {
    id: 'wl-002',
    name: 'Cardholder Slim',
    price: 1190,
    category: 'wallets',
    productType: 'accessories',
    subcategory: 'wallets',
    image: bagsImg,
    description: 'Minimal cardholder for the modern essentialist. Holds 6 cards and folded notes.',
    colorVariants: [c('Black', [bagsImg, streetwearImg]), c('Burgundy', [bagsImg, capsImg])],
    rating: 4.6,
    reviews: 64,
    inStock: true,
    material: 'Italian calf leather',
    careInstructions: accessoryCare,
  },

  /* ===================== PERFUME ===================== */
  {
    id: 'pf-001',
    name: 'Noir Oud Eau de Parfum',
    price: 4990,
    originalPrice: 5990,
    category: 'perfume',
    productType: 'perfume',
    image: perfumeImg,
    description:
      'A dramatic composition built on aged oud, smoky resins and warm amber. The Delilar signature for the discerning gentleman.',
    rating: 4.9,
    reviews: 218,
    badge: 'Best Seller',
    inStock: true,
    fragranceNotes: {
      top: ['Bergamot', 'Saffron', 'Pink Pepper'],
      heart: ['Aged Oud', 'Damask Rose', 'Smoky Cedar'],
      base: ['Amber', 'Sandalwood', 'Vanilla'],
    },
    longevity: '8–10 hours',
    projection: 'Strong · room-filling',
    volumeOptions: ['30ml', '50ml', '100ml'],
    usageGuide: 'Spray on pulse points — wrist, neck, behind the ears. Avoid rubbing.',
  },
  {
    id: 'pf-002',
    name: 'Ambre Royale Parfum',
    price: 3990,
    category: 'perfume',
    productType: 'perfume',
    image: perfumeImg,
    description: 'Liquid amber wrapped in spice and vanilla. Warm, opulent, unforgettable.',
    rating: 4.8,
    reviews: 132,
    badge: 'Premium',
    inStock: true,
    fragranceNotes: {
      top: ['Cardamom', 'Mandarin'],
      heart: ['Amber', 'Tonka Bean', 'Rose Absolute'],
      base: ['Vanilla Bourbon', 'Benzoin', 'Patchouli'],
    },
    longevity: '7–9 hours',
    projection: 'Moderate to strong',
    volumeOptions: ['50ml', '100ml'],
  },

  /* ===================== ATTAR ===================== */
  {
    id: 'at-001',
    name: 'Oud Al Majestic Attar',
    price: 2990,
    originalPrice: 3490,
    category: 'attar',
    productType: 'perfume',
    image: perfumeImg,
    description: 'Concentrated oud attar — pure, alcohol-free, with deep woody warmth.',
    rating: 4.9,
    reviews: 312,
    badge: 'Best Seller',
    inStock: true,
    fragranceNotes: {
      top: ['Saffron', 'Cinnamon'],
      heart: ['Pure Oud', 'Rose Taifi'],
      base: ['Sandalwood', 'Musk'],
    },
    longevity: '12+ hours on skin',
    projection: 'Intimate · skin-scent depth',
    volumeOptions: ['3ml', '6ml', '12ml'],
    usageGuide: 'Dab a drop on pulse points. Alcohol-free — wearable for prayer.',
  },
  {
    id: 'at-002',
    name: 'Rose Musk Attar',
    price: 1990,
    category: 'attar',
    productType: 'perfume',
    image: perfumeImg,
    description: 'Delicate rose blended with white musk. An elegant daily attar.',
    rating: 4.7,
    reviews: 198,
    inStock: true,
    fragranceNotes: {
      top: ['Pink Pepper'],
      heart: ['Bulgarian Rose', 'Geranium'],
      base: ['White Musk', 'Iris'],
    },
    longevity: '8–10 hours',
    projection: 'Soft sillage',
    volumeOptions: ['3ml', '6ml', '12ml'],
  },
  {
    id: 'at-003',
    name: 'Sandal Supreme Attar',
    price: 2490,
    originalPrice: 2990,
    category: 'attar',
    productType: 'perfume',
    image: perfumeImg,
    description: 'Pure Mysore-style sandalwood attar. Creamy, meditative, timeless.',
    rating: 4.6,
    reviews: 87,
    badge: 'New',
    inStock: true,
    fragranceNotes: {
      top: ['Cardamom'],
      heart: ['Sandalwood', 'Vetiver'],
      base: ['Musk', 'Amber'],
    },
    longevity: '10+ hours',
    projection: 'Close to skin',
    volumeOptions: ['3ml', '6ml', '12ml'],
  },

  /* ===================== EID COLLECTION ===================== */
  {
    id: 'eid-001',
    name: 'Eid Premium White Jubba Set',
    price: 7990,
    originalPrice: 9490,
    category: 'eid',
    productType: 'clothing',
    image: jubbaImg,
    description: 'Complete Eid outfit — premium white jubba with matching kufi cap and a signature attar.',
    sizes: ['M', 'L', 'XL', '2XL'],
    colorVariants: [c('White', [jubbaImg, panjabiImg]), c('Off-White', [panjabiImg, jubbaImg])],
    rating: 4.9,
    reviews: 245,
    badge: 'Eid Special',
    inStock: true,
    fabric: ['Premium Cotton Blend'],
    careInstructions: clothingCare,
    fitType: 'Regular fit',
  },
  {
    id: 'eid-002',
    name: 'Eid Golden Panjabi',
    price: 5490,
    originalPrice: 6490,
    category: 'eid',
    productType: 'clothing',
    image: panjabiImg,
    description: 'Festive golden panjabi with hand-crafted embroidery. A statement for Eid.',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colorVariants: [c('Gold', [panjabiImg, jubbaImg]), c('Cream', [panjabiImg, jubbaImg])],
    rating: 4.8,
    reviews: 178,
    badge: 'Eid Special',
    inStock: true,
    fabric: ['Silk Blend'],
    careInstructions: ['Dry clean only', 'Iron on low with cloth', 'Hang on padded hanger'],
    fitType: 'Tailored fit',
  },
];

/* ---------- Selectors ---------- */
export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const getFeaturedProducts = () =>
  products.filter((p) => p.badge === 'Best Seller').slice(0, 8);

export const getNewArrivals = () =>
  products.filter((p) => p.badge === 'New' || p.badge === 'Premium').slice(0, 8);

export const getEidProducts = () => products.filter((p) => p.category === 'eid');

/* ---------- Category meta (drives nav, routes, banners) ---------- */
export const categories = [
  { slug: 'eid', name: 'Eid Collection', description: 'Curated Eid celebration wear', group: 'Featured' },
  { slug: 'jubba', name: 'Jubba / Thobe', description: 'Tailored Islamic luxury', group: 'Apparel' },
  { slug: 'panjabi', name: 'Panjabi', description: 'Refined ethnic fashion', group: 'Apparel' },
  { slug: 'tshirts', name: 'T-Shirts', description: 'Premium daily essentials', group: 'Apparel' },
  { slug: 'polo', name: 'Polo Shirts', description: 'Refined casual classics', group: 'Apparel' },
  { slug: 'shirts', name: 'Shirts', description: 'Tailored button-downs', group: 'Apparel' },
  { slug: 'pants', name: 'Pants', description: 'Modern tailored trousers', group: 'Apparel' },
  { slug: 'hoodies', name: 'Hoodies', description: 'Elevated everyday warmth', group: 'Apparel' },
  { slug: 'caps', name: 'Caps & Kufi', description: 'Hand-stitched prayer caps', group: 'Accessories' },
  { slug: 'kuffiyah', name: 'Keffiyah', description: 'Traditional Arabic scarves', group: 'Accessories' },
  { slug: 'turban', name: 'Turban / Pagri', description: 'Ceremonial imamah', group: 'Accessories' },
  { slug: 'bags', name: 'Bags', description: 'Leather goods, hand-stitched', group: 'Accessories' },
  { slug: 'wallets', name: 'Wallets', description: 'Considered everyday carry', group: 'Accessories' },
  { slug: 'perfume', name: 'Perfume', description: 'Eau de parfum compositions', group: 'Fragrance' },
  { slug: 'attar', name: 'Attar', description: 'Alcohol-free concentrates', group: 'Fragrance' },
  { slug: 'accessories', name: 'All Accessories', description: 'Premium accessories', group: 'Accessories' },
] as const;
