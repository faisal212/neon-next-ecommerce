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

const IMAGE_DIR = join(__dirname, '..', '2091');

const IMAGES = [
  { file: 'skmei-2091-front.jpeg',     alt: 'Skmei 2091 Black/White — Front',            contentType: 'image/jpeg' },
  { file: 'skmei-2091-lifestyle.webp',  alt: 'Skmei 2091 Black/White — Lifestyle',        contentType: 'image/webp' },
  { file: 'skmei-2091-back.webp',       alt: 'Skmei 2091 Black/White — Caseback 5ATM',    contentType: 'image/webp' },
  { file: 'skmei-2091-specs.webp',      alt: 'Skmei 2091 — Product Parameters',           contentType: 'image/webp' },
];

async function uploadImage(filename: string, contentType: string): Promise<string> {
  const filePath = join(IMAGE_DIR, filename);
  const buffer = readFileSync(filePath);
  const ext = filename.split('.').pop() || 'jpg';
  const key = `products/skmei-2091/${nanoid()}.${ext}`;

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
  console.log('═══ Uploading SKMEI 2091 Digital Analog Watch ═══\n');

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
    nameEn: 'Skmei – 2091 – Digital Analog – Black/White-White',
    nameUr: 'Skmei – 2091 – ڈیجیٹل اینالاگ – بلیک/وائٹ',
    slug: 'skmei-2091-digital-analog-black-white',
    descriptionEn: `The SKMEI 2091 is a bold, feature-rich analog-digital watch inspired by the iconic G-Shock 2100 Series "Casioak" and the luxurious Patek Philippe Nautilus. It offers a simple yet striking look, perfect for casual or business occasions. A unisex timepiece featuring both analog and digital displays.

Key Features:
• Dual Time Display — Analog + Digital
• World Time — tracks time across multiple zones
• 5 Independent Alarms
• Stopwatch & Countdown Timer
• LED Backlight — enhanced visibility in low light
• 50M Water Resistance (5ATM) — daily use, handwashing, rain, short swimming
• 12/24 Hour Format
• Date & Week Display

Specifications:
• Case: ABS Plastic, 45.7mm diameter, 14mm thick
• Crystal: Resin
• Band: PU Strap with stainless steel buckle, 18mm width
• Watch Length: 255mm
• Weight: 49.7g
• Battery: CR2016

The unique double keeper strap system prevents loosening during physical activities. The strap material offers a luxurious, velvety feel. Do not press buttons while submerged.`,
    descriptionUr: `SKMEI 2091 ایک شاندار اینالاگ-ڈیجیٹل واچ ہے جو مشہور G-Shock Casioak سے متاثر ہے۔ گول ڈائل، دوہرا ڈسپلے، کیژول اور بزنس دونوں مواقع کے لیے مثالی۔

خصوصیات: دوہرا ٹائم ڈسپلے (اینالاگ + ڈیجیٹل)، ورلڈ ٹائم، 5 الارم، اسٹاپ واچ، کاؤنٹ ڈاؤن ٹائمر، LED بیک لائٹ، 50 میٹر واٹر پروف۔

کیس: ABS پلاسٹک، 45.7mm قطر، 14mm موٹائی۔ بینڈ: PU سٹریپ۔ وزن: 49.7 گرام۔ بیٹری: CR2016۔`,
    basePricePkr: '3800.00',
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
  const tags = ['skmei', 'digital', 'analog', 'watch', 'waterproof', 'casioak', '50m', 'unisex'];
  await db.insert(productTags).values(tags.map((tag) => ({ productId: prod.id, tag })));
  console.log(`  ✓ ${tags.length} tags added`);

  // ── 6. Create variant + inventory ─────────────────────────
  console.log('\n6. Creating variant & inventory...');
  const [variant] = await db.insert(productVariants).values({
    productId: prod.id,
    sku: 'SKMEI2091-BKW-ONESIZE',
    color: 'Black/White-White',
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
