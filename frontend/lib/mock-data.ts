// Mock data for products, categories, and filters
export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stock?: number;
  isNew: boolean;
  createdAt: Date;
}

export interface ProductDetail extends MockProduct {
  slug: string;
  images: string[];
  fullDescription: string;
  metaDescription: string;
  weight: string;
  sku: string;
  country: string;
  vat: number;
  shippingTime: string;
  shippingCost: number;
  freeShippingThreshold: number;
  returnDays: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: Date;
  helpful: number;
  verified: boolean;
}

export interface MockCategory {
  id: string;
  slug: string;
  name: string;
  image: string;
  count: number;
  description: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: "1",
    slug: "spices-herbs",
    name: "Spices & Herbs",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    count: 24,
    description: "Authentic Ethiopian and African spices",
  },
  {
    id: "2",
    slug: "coffee",
    name: "Coffee",
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop",
    count: 18,
    description: "Premium Ethiopian coffee beans",
  },
  {
    id: "3",
    slug: "grains-flours",
    name: "Grains & Flours",
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d9973?w=800&auto=format&fit=crop",
    count: 15,
    description: "Traditional grains and flours",
  },
  {
    id: "4",
    slug: "snacks",
    name: "Snacks",
    image:
      "https://images.unsplash.com/photo-1599599810694-b5ac4dd09639?w=800&auto=format&fit=crop",
    count: 20,
    description: "Delicious Ethiopian snacks",
  },
  {
    id: "5",
    slug: "traditional-wears",
    name: "Traditional Wears",
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop",
    count: 32,
    description: "Authentic traditional clothing",
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  // Spices & Herbs
  {
    id: "p1",
    name: "Premium Berbere Spice Blend",
    description: "Authentic Ethiopian spice blend with 16 ingredients",
    price: 12.99,
    originalPrice: 15.99,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
    category: "Spices & Herbs",
    categoryId: "1",
    rating: 4.8,
    reviewCount: 142,
    inStock: true,
    isNew: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p2",
    name: "Mitmita Hot Spice Mix",
    description: "Traditional Ethiopian hot pepper blend",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1585021366569-3a9a4b8f1abc?w=500&auto=format&fit=crop",
    category: "Spices & Herbs",
    categoryId: "1",
    rating: 4.6,
    reviewCount: 89,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p3",
    name: "Injera Spice Mix",
    description: "Perfect blend for traditional injera",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
    category: "Spices & Herbs",
    categoryId: "1",
    rating: 4.7,
    reviewCount: 56,
    inStock: true,
    isNew: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p4",
    name: "Fenugreek Seeds",
    description: "Pure fenugreek seeds from Ethiopia",
    price: 6.99,
    image:
      "https://images.unsplash.com/photo-1585021366569-3a9a4b8f1abc?w=500&auto=format&fit=crop",
    category: "Spices & Herbs",
    categoryId: "1",
    rating: 4.5,
    reviewCount: 34,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },

  // Coffee
  {
    id: "p5",
    name: "Yirgacheffe Whole Bean Coffee",
    description: "Premium Ethiopian Yirgacheffe single origin beans",
    price: 18.99,
    originalPrice: 22.99,
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop",
    category: "Coffee",
    categoryId: "2",
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
    isNew: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p6",
    name: "Sidamo Coffee Beans",
    description: "Rich and complex Ethiopian Sidamo beans",
    price: 16.99,
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b8d7?w=500&auto=format&fit=crop",
    category: "Coffee",
    categoryId: "2",
    rating: 4.8,
    reviewCount: 178,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p7",
    name: "Harrar Medium Roast",
    description: "Bold and full-bodied Ethiopian Harrar",
    price: 14.99,
    image:
      "https://images.unsplash.com/photo-1451521915811-0a3dc0dd3fff?w=500&auto=format&fit=crop",
    category: "Coffee",
    categoryId: "2",
    rating: 4.7,
    reviewCount: 145,
    inStock: false,
    isNew: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p8",
    name: "Ethiopian Espresso Blend",
    description: "Perfect blend for espresso shots",
    price: 15.99,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop",
    category: "Coffee",
    categoryId: "2",
    rating: 4.6,
    reviewCount: 92,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },

  // Grains & Flours
  {
    id: "p9",
    name: "Teff Flour (1kg)",
    description: "Traditional Ethiopian teff flour for injera",
    price: 7.99,
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d9973?w=500&auto=format&fit=crop",
    category: "Grains & Flours",
    categoryId: "3",
    rating: 4.8,
    reviewCount: 167,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p10",
    name: "Barley Flour (500g)",
    description: "Quality barley flour for baking",
    price: 5.99,
    image:
      "https://images.unsplash.com/photo-1599599810694-b5ac4dd09639?w=500&auto=format&fit=crop",
    category: "Grains & Flours",
    categoryId: "3",
    rating: 4.4,
    reviewCount: 45,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p11",
    name: "Wheat Berries (1kg)",
    description: "Whole grain wheat berries",
    price: 6.49,
    image:
      "https://images.unsplash.com/photo-1599599810694-b5ac4dd09639?w=500&auto=format&fit=crop",
    category: "Grains & Flours",
    categoryId: "3",
    rating: 4.5,
    reviewCount: 67,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p12",
    name: "Millet Seeds (500g)",
    description: "Traditional millet seeds",
    price: 4.99,
    image:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d9973?w=500&auto=format&fit=crop",
    category: "Grains & Flours",
    categoryId: "3",
    rating: 4.3,
    reviewCount: 34,
    inStock: false,
    isNew: false,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  },

  // Snacks
  {
    id: "p13",
    name: "Doro Wot Seasoning Kit",
    description: "Complete kit for authentic doro wot",
    price: 11.99,
    originalPrice: 14.99,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
    category: "Snacks",
    categoryId: "4",
    rating: 4.7,
    reviewCount: 89,
    inStock: true,
    isNew: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p14",
    name: "Ethiopian Popcorn (200g)",
    description: "Seasoned traditional Ethiopian popcorn",
    price: 4.49,
    image:
      "https://images.unsplash.com/photo-1599599810694-b5ac4dd09639?w=500&auto=format&fit=crop",
    category: "Snacks",
    categoryId: "4",
    rating: 4.2,
    reviewCount: 56,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p15",
    name: "Roasted Chickpeas Mix",
    description: "Crunchy roasted chickpea snack",
    price: 5.99,
    image:
      "https://images.unsplash.com/photo-1599599810694-b5ac4dd09639?w=500&auto=format&fit=crop",
    category: "Snacks",
    categoryId: "4",
    rating: 4.5,
    reviewCount: 73,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p16",
    name: "Ethiopian Honey Snack Bar",
    description: "Traditional honey and nut bar",
    price: 6.99,
    image:
      "https://images.unsplash.com/photo-1599599810694-b5ac4dd09639?w=500&auto=format&fit=crop",
    category: "Snacks",
    categoryId: "4",
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },

  // Traditional Wears
  {
    id: "p17",
    name: "Traditional Habesha Dress (Women)",
    description: "Authentic Ethiopian traditional dress with embroidery",
    price: 89.99,
    originalPrice: 119.99,
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop",
    category: "Traditional Wears",
    categoryId: "5",
    rating: 4.9,
    reviewCount: 245,
    inStock: true,
    isNew: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p18",
    name: "Men's Traditional Shamma",
    description: "Handwoven Ethiopian shamma cloth",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1595460295336-a92e05ebd1a2?w=500&auto=format&fit=crop",
    category: "Traditional Wears",
    categoryId: "5",
    rating: 4.7,
    reviewCount: 123,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p19",
    name: "Embroidered Ethiopian Head Wrap",
    description: "Beautiful embroidered head wrap",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop",
    category: "Traditional Wears",
    categoryId: "5",
    rating: 4.6,
    reviewCount: 87,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
  },
  {
    id: "p20",
    name: "Traditional Ethiopian Necklace Set",
    description: "Handcrafted beaded necklace set",
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop",
    category: "Traditional Wears",
    categoryId: "5",
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    isNew: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
];

// Helper functions
export function getProductsByFilters(filters: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  rating?: number;
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  let filtered = [...MOCK_PRODUCTS];

  // Filter by category
  if (filters.categoryId) {
    filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
  }

  // Filter by price
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  // Filter by rating
  if (filters.rating !== undefined) {
    filtered = filtered.filter((p) => p.rating >= filters.rating!);
  }

  // Filter by stock
  if (filters.inStockOnly) {
    filtered = filtered.filter((p) => p.inStock);
  }

  // Sort
  const sortBy = filters.sortBy || "createdAt";
  switch (sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "popular":
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "createdAt":
    default:
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  return {
    products: filtered.slice(skip, skip + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export function getCategoryBySlug(slug: string) {
  return MOCK_CATEGORIES.find((c) => c.slug === slug);
}

export function getPriceRange() {
  const prices = MOCK_PRODUCTS.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

// Extended product details
export const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  p1: {
    id: "p1",
    slug: "premium-berbere-spice-blend",
    name: "Premium Berbere Spice Blend",
    description: "Authentic Ethiopian spice blend with 16 ingredients",
    fullDescription: `This premium Berbere spice blend is carefully crafted using authentic Ethiopian recipes passed down through generations. Our blend combines 16 carefully selected spices including chili peppers, garlic, ginger, fenugreek, and more. Perfect for traditional Ethiopian dishes like Doro Wot, Miser Wot, and Gomen.

Each batch is freshly ground to preserve maximum flavor and aroma. Our spices are sourced directly from local Ethiopian farmers who maintain the highest quality standards.

Perfect for:
- Doro Wot (chicken stew)
- Miser Wot (lentil stew)
- Gomen (collard greens)
- Tibs (sautéed meat)
- Shiro (chickpea paste)`,
    metaDescription:
      "Authentic Ethiopian Berbere spice blend with 16 ingredients. Premium quality, freshly ground. Perfect for traditional Ethiopian cooking.",
    price: 12.99,
    originalPrice: 15.99,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1585021366569-3a9a4b8f1abc?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop",
    ],
    category: "Spices & Herbs",
    categoryId: "1",
    rating: 4.8,
    reviewCount: 142,
    inStock: true,
    stock: 45,
    isNew: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    weight: "100g",
    sku: "BRB-001",
    country: "Ethiopia",
    vat: 7,
    shippingTime: "3-5 Werktage",
    shippingCost: 4.99,
    freeShippingThreshold: 50,
    returnDays: 14,
  },
  p5: {
    id: "p5",
    slug: "yirgacheffe-whole-bean-coffee",
    name: "Yirgacheffe Whole Bean Coffee",
    description: "Premium Ethiopian Yirgacheffe single origin beans",
    fullDescription: `Experience the exceptional taste of Ethiopian Yirgacheffe, one of the world's most sought-after coffee origins. This single-origin coffee comes from the birthplace of coffee in the Yirgacheffe region of southern Ethiopia.

Flavor Profile:
- Bright, fruity notes with hints of blueberry and orange
- Medium acidity with a smooth, balanced body
- Subtle floral undertones
- Clean finish

Our Yirgacheffe beans are carefully hand-picked and naturally processed to preserve their unique characteristics. Each batch is roasted to perfection to bring out the best in these exceptional beans.

Perfect for:
- Pour over coffee
- French press
- Espresso machines
- Cold brew`,
    metaDescription:
      "Premium Ethiopian Yirgacheffe single origin whole bean coffee. Bright, fruity flavor with blueberry and citrus notes. Freshly roasted.",
    price: 18.99,
    originalPrice: 22.99,
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559056199-641a0ac8b8d7?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop",
    ],
    category: "Coffee",
    categoryId: "2",
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
    stock: 78,
    isNew: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    weight: "500g",
    sku: "YRG-001",
    country: "Ethiopia",
    vat: 7,
    shippingTime: "3-5 Werktage",
    shippingCost: 4.99,
    freeShippingThreshold: 50,
    returnDays: 14,
  },
};

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p1",
    author: "Maria S.",
    rating: 5,
    title: "Authentisches Aroma!",
    content:
      "Dieses Berbere-Gewürz schmeckt genau wie das, das meine äthiopische Familie daheim verwendet. Der Geschmack ist intensiv und auswirklich frisch. Highly recommended!",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    helpful: 24,
    verified: true,
  },
  {
    id: "r2",
    productId: "p1",
    author: "Klaus M.",
    rating: 5,
    title: "Perfekt für Doro Wot",
    content:
      "Hab dieses Gewürz für mein Doro Wot verwendet und die Ergebnisse waren fantastisch. Es hat den authentischen äthiopischen Geschmack, den ich gesucht habe.",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    helpful: 18,
    verified: true,
  },
  {
    id: "r3",
    productId: "p1",
    author: "Anna L.",
    rating: 4,
    title: "Guter Geschmack, etwas schärfer",
    content:
      "Das Gewürz ist wirklich lecker, aber es ist ziemlich scharf. Für meine Familie war es ein bisschen zu viel. Trotzdem ein gutes Produkt.",
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    helpful: 12,
    verified: true,
  },
  {
    id: "r4",
    productId: "p5",
    author: "David K.",
    rating: 5,
    title: "Das beste Yirgacheffe, das ich je probiert habe",
    content:
      "Diese Kaffeebohnen sind außergewöhnlich. Der fruchtigen Geschmack ist sehr ausgewogen und die Säure ist perfekt. Mein Go-to Kaffee jetzt!",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    helpful: 31,
    verified: true,
  },
  {
    id: "r5",
    productId: "p5",
    author: "Patricia H.",
    rating: 5,
    title: "Frisch geröstet, hervorragend",
    content:
      "Ich bin sehr beeindruckt von der Qualität und Frische dieser Bohnen. Meine Küche riecht herrlich nach dem Rösten. Werde sicher wieder bestellen!",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    helpful: 27,
    verified: true,
  },
  {
    id: "r6",
    productId: "p5",
    rating: 4,
    author: "Thomas P.",
    title: "Sehr guter Kaffee, gutes Preis-Leistungs-Verhältnis",
    content:
      "Dies ist ein großer Kaffee mit guter Komplexität. Für den Preis kann man nicht viel besser bekommen. Meine einzige Beschwerde ist, dass die Verpackung ein bisschen minimalistisch ist.",
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    helpful: 19,
    verified: true,
  },
];

export function getProductDetail(id: string): ProductDetail | undefined {
  const baseProduct = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!baseProduct) return undefined;
  return (
    PRODUCT_DETAILS[id] || {
      ...baseProduct,
      slug: baseProduct.name.toLowerCase().replace(/\s+/g, "-"),
      images: [baseProduct.image],
      fullDescription: baseProduct.description,
      metaDescription: baseProduct.description,
      weight: "N/A",
      sku: "N/A",
      country: "Ethiopia",
      vat: 7,
      shippingTime: "3-5 Werktage",
      shippingCost: 4.99,
      freeShippingThreshold: 50,
      returnDays: 14,
    }
  );
}

export function getProductReviews(productId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.productId === productId);
}

export function getRelatedProducts(productId: string, limit: number = 4) {
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) return [];

  return MOCK_PRODUCTS.filter(
    (p) => p.categoryId === product.categoryId && p.id !== productId,
  ).slice(0, limit);
}
