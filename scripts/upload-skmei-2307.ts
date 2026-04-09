import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import {
  categories,
  products,
  productVariants,
  inventory,
  productImages,
  productTags,
} from '../lib/db/schema/catalog';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const IMAGE_DIR = join(__dirname, '..', '2307');

const IMAGES = [
  { file: 'skmei-2307-silver-front.jpeg',     alt: 'Skmei 2307 Silver/Steel — Front',     contentType: 'image/jpeg' },
  { file: 'skmei-2307-silver-lifestyle.jpeg',  alt: 'Skmei 2307 Silver/Steel — Lifestyle',  contentType: 'image/jpeg' },
  { file: 'skmei-2307-silver-angle.jpeg',      alt: 'Skmei 2307 Silver/Steel — Angle',      contentType: 'image/jpeg' },
];

async function uploadImage(filename: string, contentType: string): Promise<string> {
  const filePath = join(IMAGE_DIR, filename);
  const buffer = readFileSync(filePath);
  const ext = filename.split('.').pop() || 'jpg';
  const key = `products/skmei-2307/${nanoid()}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  const url = `${PUBLIC_URL}/${key}`;
  console.log(`  ✓ Uploaded ${filename} → ${url}`);
  return url;
}

async function main() {
  console.log('═══ Uploading SKMEI 2307 Digital Sports Watch ═══\n');

  // ── 1. Find "Watches" category ────────────────────────────
  console.log('1. Category lookup...');
  const [watches] = await db.select().from(categories).where(eq(categories.slug, 'watches'));
  if (!watches) throw new Error('"Watches" category not found');
  console.log(`  ✓ Found "Watches" category: ${watches.id}`);

  // ── 2. Upload images to R2 ────────────────────────────────
  console.log('\n2. Uploading images to R2...');
  const imageUrls: string[] = [];
  for (const img of IMAGES) {
    const url = await uploadImage(img.file, img.contentType);
    imageUrls.push(url);
  }

  // ── 3. Create product ─────────────────────────────────────
  console.log('\n3. Creating product...');
  const [prod] = await db.insert(products).values({
    categoryId: watches.id,
    nameEn: 'Skmei 2307 – Digital Sports Watch – Silver/Steel',
    nameUr: 'Skmei 2307 – ڈیجیٹل اسپورٹس واچ – سلور/اسٹیل',
    slug: 'skmei-2307-digital-sports-watch-silver-steel',
    descriptionEn: `The SKMEI 2307 is a rugged and reliable timepiece designed for athletes and fitness enthusiasts who need a watch that can keep up with an active lifestyle. It features a bold square face, digital display, and a range of sport-focused functions.

Key Features:
• Dual Time — track two time zones simultaneously
• Stopwatch & Countdown Timer — precision timing for workouts
• EL Luminous Backlight — easy reading in dark environments
• 50M Water Resistance — swimming, surfing, and water activities
• Alarm & Hourly Time Signal
• Date & Day of the Week Display
• 12/24 Hour Format
• Hidden Clasp — secure, clean-looking buckle design

Specifications:
• Case: ABS, 42.9mm width × 45mm height × 13.3mm thick
• Mirror: Resin
• Band: Stainless Steel, 24.5mm width
• Bottom Cover: Stainless Steel
• Total Length: 220mm
• Weight: 81.7g
• Battery: CR2025
• Water Resistance: 50 Meters

Built to last with a durable ABS case and precise digital movement. The silver/steel version adds a polished, versatile look for both sport and casual everyday wear. Do not press buttons underwater.`,
    descriptionUr: `SKMEI 2307 ایک مضبوط اور قابل اعتماد ڈیجیٹل اسپورٹس واچ ہے جو کھلاڑیوں اور فٹنس کے شوقین افراد کے لیے بنائی گئی ہے۔ مربع ڈائل، اسٹینلیس سٹیل بینڈ۔

خصوصیات: دوہرا ٹائم زون، اسٹاپ واچ، کاؤنٹ ڈاؤن ٹائمر، EL بیک لائٹ، 50 میٹر واٹر پروف، الارم، تاریخ، ہفتے کا دن، 12/24 گھنٹے فارمیٹ۔

کیس: ABS، 42.9mm × 45mm، 13.3mm موٹائی۔ بینڈ: اسٹینلیس سٹیل۔ وزن: 81.7 گرام۔ بیٹری: CR2025۔`,
    basePricePkr: '3400.00',
    isActive: true,
    isFeatured: false,
  }).returning();
  console.log(`  ✓ Product created: ${prod.id}`);

  // ── 4. Insert images ──────────────────────────────────────
  console.log('\n4. Attaching images...');
  for (let i = 0; i < IMAGES.length; i++) {
    await db.insert(productImages).values({
      productId: prod.id,
      url: imageUrls[i],
      altText: IMAGES[i].alt,
      isPrimary: i === 0,
      sortOrder: i,
    });
  }
  console.log(`  ✓ ${IMAGES.length} images attached`);

  // ── 5. Insert tags ────────────────────────────────────────
  console.log('\n5. Adding tags...');
  const tags = ['skmei', 'digital', 'watch', 'sports', 'waterproof', 'stainless-steel', '50m', 'el-luminous'];
  await db.insert(productTags).values(tags.map((tag) => ({ productId: prod.id, tag })));
  console.log(`  ✓ ${tags.length} tags added`);

  // ── 6. Create variant + inventory ─────────────────────────
  console.log('\n6. Creating variant & inventory...');
  const [variant] = await db.insert(productVariants).values({
    productId: prod.id,
    sku: 'SKMEI2307-SIL-ONESIZE',
    color: 'Silver/Steel',
    size: 'One Size',
    extraPricePkr: '0',
    isActive: true,
  }).returning();

  await db.insert(inventory).values({
    variantId: variant.id,
    quantityOnHand: 25,
    quantityReserved: 0,
    lowStockThreshold: 5,
  });
  console.log(`  ✓ Variant SKU: ${variant.sku}`);
  console.log(`  ✓ Inventory: 25 units`);

  console.log('\n═══ Done! Product uploaded successfully ═══');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
