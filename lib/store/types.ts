/** Product as returned from getProductBySlug / listProducts */
export interface StoreProduct {
  id: string;
  nameEn: string;
  nameUr: string | null;
  slug: string;
  descriptionEn: string | null;
  descriptionUr: string | null;
  basePricePkr: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  createdAt: Date;
  category?: {
    id: string;
    nameEn: string;
    slug: string;
  };
  variants?: StoreVariant[];
  images?: StoreImage[];
  tags?: string[];
}

export interface StoreVariant {
  id: string;
  productId: string;
  sku: string;
  color: string | null;
  size: string | null;
  extraPricePkr: string | null;
  isActive: boolean;
  inventory?: {
    quantityOnHand: number;
    quantityReserved: number;
    lowStockThreshold: number;
  } | null;
}

export interface StoreImage {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface StoreCategory {
  id: string;
  nameEn: string;
  nameUr: string | null;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: StoreCategory[];
}

/** Matches the flat shape returned by getCartWithItems() */
export interface CartItemData {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPricePkr: string;
  addedAt: string | Date;
  sku: string;
  color: string | null;
  size: string | null;
  productId: string;
  /** Enriched client-side fields (optional) */
  productName?: string;
  productSlug?: string;
  imageUrl?: string;
}

export interface CartData {
  id: string;
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
}

export interface DeliveryZone {
  id: string;
  city: string;
  province: string;
  shippingChargePkr: string;
  estimatedDays: number;
  isCodAvailable: boolean;
}
