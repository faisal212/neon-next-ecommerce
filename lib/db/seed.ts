import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories, products, productVariants, inventory, productImages } from './schema/catalog';
import { deliveryZones, coupons } from './schema/orders';
import { banners } from './schema/marketing';
import { appSettings } from './schema/support';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log('Seeding database...');

  // ── Categories ─────────────────────────────────────────────────
  const [menswear] = await db.insert(categories).values({ nameEn: 'Menswear', nameUr: 'مردانہ لباس', slug: 'menswear', sortOrder: 1 }).returning();
  const [womenswear] = await db.insert(categories).values({ nameEn: 'Womenswear', nameUr: 'خواتین کا لباس', slug: 'womenswear', sortOrder: 2 }).returning();
  const [kids] = await db.insert(categories).values({ nameEn: 'Kids', nameUr: 'بچوں کے کپڑے', slug: 'kids', sortOrder: 3 }).returning();
  const [accessories] = await db.insert(categories).values({ nameEn: 'Accessories', nameUr: 'لوازمات', slug: 'accessories', sortOrder: 4 }).returning();

  // Subcategories
  const [kurtas] = await db.insert(categories).values({ nameEn: 'Kurtas', nameUr: 'کرتے', slug: 'kurtas', parentId: menswear.id, sortOrder: 1 }).returning();
  const [shalwarKameez] = await db.insert(categories).values({ nameEn: 'Shalwar Kameez', nameUr: 'شلوار قمیض', slug: 'shalwar-kameez', parentId: menswear.id, sortOrder: 2 }).returning();
  await db.insert(categories).values({ nameEn: 'Lawn', nameUr: 'لان', slug: 'lawn', parentId: womenswear.id, sortOrder: 1 });
  await db.insert(categories).values({ nameEn: 'Formal', nameUr: 'فارمل', slug: 'formal', parentId: womenswear.id, sortOrder: 2 });

  console.log('  Categories seeded');

  // ── Products ───────────────────────────────────────────────────
  const productData = [
    { categoryId: kurtas.id, nameEn: 'Premium Cotton Kurta', nameUr: 'پریمیم کاٹن کرتا', slug: 'premium-cotton-kurta', basePricePkr: '2500.00', isFeatured: true },
    { categoryId: kurtas.id, nameEn: 'Linen Summer Kurta', nameUr: 'لینن سمر کرتا', slug: 'linen-summer-kurta', basePricePkr: '3200.00', isFeatured: true },
    { categoryId: shalwarKameez.id, nameEn: 'Classic White Shalwar Kameez', nameUr: 'کلاسک سفید شلوار قمیض', slug: 'classic-white-shalwar-kameez', basePricePkr: '4500.00', isFeatured: false },
    { categoryId: shalwarKameez.id, nameEn: 'Embroidered Eid Collection', nameUr: 'عید کلیکشن', slug: 'embroidered-eid-collection', basePricePkr: '7800.00', isFeatured: true },
    { categoryId: accessories.id, nameEn: 'Peshawari Chappal', nameUr: 'پشاوری چپل', slug: 'peshawari-chappal', basePricePkr: '1800.00', isFeatured: false },
  ];

  for (const p of productData) {
    const [product] = await db.insert(products).values(p).returning();

    // Add variants
    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['White', 'Blue', 'Black'];

    for (const color of colors.slice(0, 2)) {
      for (const size of sizes) {
        const sku = `${p.slug.slice(0, 10).toUpperCase()}-${color.slice(0, 3).toUpperCase()}-${size}`;
        const [variant] = await db.insert(productVariants).values({
          productId: product.id,
          sku,
          color,
          size,
          extraPricePkr: size === 'XL' ? '200.00' : '0',
        }).returning();

        await db.insert(inventory).values({
          variantId: variant.id,
          quantityOnHand: Math.floor(20 + Math.random() * 80),
          quantityReserved: 0,
          lowStockThreshold: 5,
        });
      }
    }
  }
  console.log('  Products + variants + inventory seeded');

  // ── Delivery Zones ─────────────────────────────────────────────
  const zones = [
    { city: 'Karachi', province: 'Sindh', shippingChargePkr: '200.00', estimatedDays: 3, isCodAvailable: true },
    { city: 'Lahore', province: 'Punjab', shippingChargePkr: '150.00', estimatedDays: 2, isCodAvailable: true },
    { city: 'Islamabad', province: 'ICT', shippingChargePkr: '180.00', estimatedDays: 2, isCodAvailable: true },
    { city: 'Rawalpindi', province: 'Punjab', shippingChargePkr: '180.00', estimatedDays: 2, isCodAvailable: true },
    { city: 'Faisalabad', province: 'Punjab', shippingChargePkr: '200.00', estimatedDays: 3, isCodAvailable: true },
    { city: 'Peshawar', province: 'KPK', shippingChargePkr: '250.00', estimatedDays: 4, isCodAvailable: true },
    { city: 'Quetta', province: 'Balochistan', shippingChargePkr: '350.00', estimatedDays: 5, isCodAvailable: false },
    { city: 'Multan', province: 'Punjab', shippingChargePkr: '200.00', estimatedDays: 3, isCodAvailable: true },
    { city: 'Hyderabad', province: 'Sindh', shippingChargePkr: '220.00', estimatedDays: 3, isCodAvailable: true },
    { city: 'Gilgit', province: 'GB', shippingChargePkr: '400.00', estimatedDays: 7, isCodAvailable: false },
  ];
  await db.insert(deliveryZones).values(zones);
  console.log('  Delivery zones seeded');

  // ── Coupons ────────────────────────────────────────────────────
  await db.insert(coupons).values([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: '10.00', minOrderPkr: '1000.00', maxDiscountPkr: '500.00', maxUses: 1000, isActive: true },
    { code: 'EID2026', discountType: 'flat_pkr', discountValue: '500.00', minOrderPkr: '3000.00', maxUses: 500, isActive: true },
    { code: 'FREESHIP', discountType: 'flat_pkr', discountValue: '200.00', minOrderPkr: '2000.00', maxUses: null, isActive: true },
  ]);
  console.log('  Coupons seeded');

  // ── Banners ────────────────────────────────────────────────────
  await db.insert(banners).values([
    { title: 'Eid Collection 2026', imageUrl: '/banners/eid-2026.jpg', linkUrl: '/categories/formal', placement: 'hero', sortOrder: 1 },
    { title: 'Summer Sale - Up to 50% Off', imageUrl: '/banners/summer-sale.jpg', linkUrl: '/products?featured=true', placement: 'hero', sortOrder: 2 },
    { title: 'Free Delivery on Orders Above Rs. 2000', imageUrl: '/banners/free-delivery.jpg', linkUrl: '/products', placement: 'category_top', sortOrder: 1 },
  ]);
  console.log('  Banners seeded');

  // ── App Settings ───────────────────────────────────────────────
  await db.insert(appSettings).values([
    { key: 'cod_enabled', value: true, description: 'Enable Cash on Delivery payment method' },
    { key: 'min_order_pkr', value: 500, description: 'Minimum order amount in PKR' },
    { key: 'cod_charge_pkr', value: 50, description: 'COD handling fee in PKR' },
    { key: 'maintenance_mode', value: false, description: 'Enable maintenance mode' },
    { key: 'loyalty_points_per_100_pkr', value: 1, description: 'Points earned per Rs. 100 spent' },
  ]);
  console.log('  App settings seeded');

  console.log('\nDone! Database seeded successfully.');
}

seed().catch(console.error);
