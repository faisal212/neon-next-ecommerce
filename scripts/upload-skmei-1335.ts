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

const IMAGE_DIR = join(__dirname, '..', '1335-8');

const IMAGES = [
  { file: 'skmei-1335-silver-main.png',       alt: 'Skmei 1335 Silver — Product Shot',     contentType: 'image/png'  },
  { file: 'skmei-1335-silver-waterproof.jpeg', alt: 'Skmei 1335 Silver — Water Resistance', contentType: 'image/jpeg' },
  { file: 'skmei-1335-silver-wrist.jpeg',      alt: 'Skmei 1335 Silver — On Wrist',         contentType: 'image/jpeg' },
  { file: 'skmei-1335-silver-specs.jpg',       alt: 'Skmei 1335 Silver — Technical Specs',  contentType: 'image/jpeg' },
];

async function uploadImage(filename: string, contentType: string): Promise<string> {
  const filePath = join(IMAGE_DIR, filename);
  const buffer = readFileSync(filePath);
  const ext = filename.split('.').pop() || 'jpg';
  const key = `products/skmei-1335/${nanoid()}.${ext}`;

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
  console.log('═══ Uploading SKMEI 1335 Digital Sports Watch ═══\n');

  // ── 1. Find or create "Watches" category ──────────────────
  console.log('1. Category setup...');
  const [acc] = await db.select().from(categories).where(eq(categories.slug, 'accessories'));
  if (!acc) throw new Error('Accessories category not found — run seed first');

  let [watches] = await db.select().from(categories).where(eq(categories.slug, 'watches'));
  if (!watches) {
    [watches] = await db.insert(categories).values({
      nameEn: 'Watches',
      nameUr: 'گھڑیاں',
      slug: 'watches',
      parentId: acc.id,
      sortOrder: 5,
    }).returning();
    console.log('  ✓ Created "Watches" subcategory');
  } else {
    console.log('  ✓ "Watches" subcategory already exists');
  }

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
    nameEn: 'Skmei – 1335 – Digital Sports Countdown Waterproof Watch – Silver',
    nameUr: 'Skmei – 1335 – ڈیجیٹل اسپورٹس کاؤنٹ ڈاؤن واٹر پروف واچ – سلور',
    slug: 'skmei-1335-digital-sports-watch-silver',
    descriptionEn: `The SKMEI 1335 is a blend of performance, elegance, and modern design, built to handle an active lifestyle. It features a bold square dial and a sleek stainless steel band, making it ideal for work, casual outings, or gifting.

Key Features:
• Dual Time Zones — track two time zones simultaneously
• Countdown Timer & Chronograph — perfect for workouts and sports
• EL Backlight — easy reading in low-light conditions
• 50M Water Resistance — withstands splashes, sweat, handwashing, and cold showers
• Alarm Clock, Calendar & Week Display
• 12/24 Hour Clock

Build & Materials:
• Case: ABS with scratch-resistant resin crystal
• Band: Stainless steel
• Case Cover: Stainless steel waterproof
• Weight: 85g

Note: Do not press buttons underwater or wear for long-term underwater activities.`,
    descriptionUr: `SKMEI 1335 ایک شاندار ڈیجیٹل اسپورٹس واچ ہے جو کارکردگی اور جدید ڈیزائن کا حسین امتزاج ہے۔ اسٹینلیس سٹیل بینڈ اور مربع ڈائل کے ساتھ یہ گھڑی دفتر، روزمرہ استعمال اور تحفے کے لیے مثالی ہے۔

خصوصیات: دوہرا ٹائم زون، الٹی گنتی ٹائمر، کرونوگراف، EL بیک لائٹ، 50 میٹر واٹر پروف، الارم، کیلنڈر، 12/24 گھنٹے کی گھڑی۔ وزن: 85 گرام۔`,
    basePricePkr: '3500.00',
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
  const tags = ['skmei', 'digital', 'watch', 'sports', 'waterproof', 'stainless-steel', '50m'];
  await db.insert(productTags).values(tags.map((tag) => ({ productId: prod.id, tag })));
  console.log(`  ✓ ${tags.length} tags added`);

  // ── 6. Create variant + inventory ─────────────────────────
  console.log('\n6. Creating variant & inventory...');
  const [variant] = await db.insert(productVariants).values({
    productId: prod.id,
    sku: 'SKMEI1335-SIL-ONESIZE',
    color: 'Silver',
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
