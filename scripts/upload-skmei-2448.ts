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

const IMAGE_DIR = join(__dirname, '..', '2448');

interface ImageDef {
  file: string;
  alt: string;
  contentType: string;
  variant: 'silver' | 'black' | null;
}

const IMAGES: ImageDef[] = [
  // Silver variant images (sort 0-2)
  { file: 'skmei-2448-silver-closeup.png',   alt: 'Skmei 2448 Silver-White — Close Up',   contentType: 'image/png',  variant: 'silver' },
  { file: 'skmei-2448-silver-front.png',      alt: 'Skmei 2448 Silver-White — Front',      contentType: 'image/png',  variant: 'silver' },
  { file: 'skmei-2448-silver-lifestyle.png',  alt: 'Skmei 2448 Silver-White — Lifestyle',  contentType: 'image/png',  variant: 'silver' },
  // Black variant images (sort 3-5)
  { file: 'skmei-2448-black-water.png',       alt: 'Skmei 2448 Black-White — Water Resistant', contentType: 'image/png',  variant: 'black' },
  { file: 'skmei-2448-black-lifestyle.png',   alt: 'Skmei 2448 Black-White — Lifestyle',   contentType: 'image/png',  variant: 'black' },
  { file: 'skmei-2448-black-closeup.png',     alt: 'Skmei 2448 Black-White — Close Up',    contentType: 'image/png',  variant: 'black' },
  // Shared image (sort 6)
  { file: 'skmei-2448-features.jpeg',         alt: 'Skmei 2448 — Feature Set',             contentType: 'image/jpeg', variant: null },
];

async function uploadImage(filename: string, contentType: string): Promise<string> {
  const filePath = join(IMAGE_DIR, filename);
  const buffer = readFileSync(filePath);
  const ext = filename.split('.').pop() || 'jpg';
  const key = `products/skmei-2448/${nanoid()}.${ext}`;

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
  console.log('═══ Uploading SKMEI 2448 Business Digital Wristwatch ═══\n');

  // ── 1. Find "Watches" category ────────────────────────────
  console.log('1. Category lookup...');
  const [watches] = await db.select().from(categories).where(eq(categories.slug, 'watches'));
  if (!watches) throw new Error('"Watches" category not found — run skmei-1335 upload first');
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
    nameEn: 'Skmei – 2448 – Business Digital Wristwatch',
    nameUr: 'Skmei – 2448 – بزنس ڈیجیٹل رسٹ واچ',
    slug: 'skmei-2448-business-digital-wristwatch',
    descriptionEn: `The SKMEI 2448 presents a luxurious design with a square zinc alloy case that is just 9mm thick, paired with a polished stainless steel strap. Its striking digital display features a black background with white text, making it easy to read at a glance.

Key Features:
• Dual Time Zones — track two time zones simultaneously
• Countdown Timer & Chronograph — great for timing activities
• LED Backlight — vibrant blue light for low-light visibility
• 30M Water Resistance — splashes, sweat, and handwashing
• Alarm Clock, Date & Week Display
• 12/24 Hour Clock

Specifications:
• Case: Zinc Alloy (32.3mm × 40mm), 9mm thick
• Band: Polished Stainless Steel, 20.7mm width
• Total Length: 235mm
• Weight: 75.8g
• Movement: Digital / Electronic
• Battery: CR2016
• Water Resistance: 30 Meters (3 Bar)

The modern digital display presents a striking contrast with its black background and white text, ensuring legibility at a glance. Ideal for both business meetings and casual outings, this watch seamlessly integrates into daily life, providing elegance and utility in every moment.`,
    descriptionUr: `SKMEI 2448 ایک خوبصورت بزنس ڈیجیٹل واچ ہے جس میں زنک ایلائے کیس اور پالش شدہ اسٹینلیس سٹیل بینڈ ہے۔ صرف 9mm موٹا کیس، سیاہ پس منظر پر سفید ٹیکسٹ ڈسپلے۔

خصوصیات: دوہرا ٹائم زون، الٹی گنتی ٹائمر، کرونوگراف، LED بیک لائٹ، 30 میٹر واٹر پروف، الارم، تاریخ، ہفتے کا دن، 12/24 گھنٹے کی گھڑی۔

وزن: 75.8 گرام۔ بیٹری: CR2016۔ دفتر اور روزمرہ استعمال دونوں کے لیے مثالی۔`,
    basePricePkr: '3000.00',
    isActive: true,
    isFeatured: false,
  }).returning();
  console.log(`  ✓ Product created: ${prod.id}`);

  // ── 4. Create variants ────────────────────────────────────
  console.log('\n4. Creating variants...');
  const [silverVariant] = await db.insert(productVariants).values({
    productId: prod.id,
    sku: 'SKMEI2448-SIL-ONESIZE',
    color: 'Silver-White',
    size: 'One Size',
    extraPricePkr: '0',
    isActive: true,
  }).returning();
  console.log(`  ✓ Silver-White variant: ${silverVariant.sku}`);

  const [blackVariant] = await db.insert(productVariants).values({
    productId: prod.id,
    sku: 'SKMEI2448-BLK-ONESIZE',
    color: 'Black-White',
    size: 'One Size',
    extraPricePkr: '0',
    isActive: true,
  }).returning();
  console.log(`  ✓ Black-White variant: ${blackVariant.sku}`);

  // ── 5. Create inventory ───────────────────────────────────
  console.log('\n5. Creating inventory...');
  await db.insert(inventory).values([
    { variantId: silverVariant.id, quantityOnHand: 25, quantityReserved: 0, lowStockThreshold: 5 },
    { variantId: blackVariant.id, quantityOnHand: 25, quantityReserved: 0, lowStockThreshold: 5 },
  ]);
  console.log('  ✓ 25 units each variant');

  // ── 6. Insert images with variant assignment ──────────────
  console.log('\n6. Attaching images...');
  const variantMap = { silver: silverVariant.id, black: blackVariant.id };

  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    await db.insert(productImages).values({
      productId: prod.id,
      variantId: img.variant ? variantMap[img.variant] : null,
      url: imageUrls[i],
      altText: img.alt,
      isPrimary: i === 0,
      sortOrder: i,
    });
  }
  console.log(`  ✓ ${IMAGES.length} images attached (variant-linked)`);

  // ── 7. Insert tags ────────────────────────────────────────
  console.log('\n7. Adding tags...');
  const tags = ['skmei', 'digital', 'watch', 'business', 'waterproof', 'stainless-steel', '30m', 'zinc-alloy'];
  await db.insert(productTags).values(tags.map((tag) => ({ productId: prod.id, tag })));
  console.log(`  ✓ ${tags.length} tags added`);

  console.log('\n═══ Done! Product uploaded successfully ═══');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
