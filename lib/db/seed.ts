import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories, products, productVariants, inventory, productImages, productTags } from './schema/catalog';
import { deliveryZones, coupons } from './schema/orders';
import { banners, flashSales, flashSaleProducts } from './schema/marketing';
import { appSettings, notificationTemplates } from './schema/support';
import { categorySeo } from './schema/seo';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ── Unsplash direct image URL helper ─────────────────────────
function img(id: string, w = 800): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

async function seed() {
  console.log('Seeding database...\n');

  // ═══════════════════════════════════════════════════════════
  //  CATEGORIES  (4 main + 14 sub = 18 total)
  // ═══════════════════════════════════════════════════════════

  const [menswear] = await db.insert(categories).values({
    nameEn: 'Menswear', nameUr: 'مردانہ لباس', slug: 'menswear', sortOrder: 1,
    imageUrl: img('1507003211169-0a1dd7228f2d', 600),
  }).returning();
  const [womenswear] = await db.insert(categories).values({
    nameEn: 'Womenswear', nameUr: 'خواتین کا لباس', slug: 'womenswear', sortOrder: 2,
    imageUrl: img('1487412720507-e7ab37603c6f', 600),
  }).returning();
  const [kids] = await db.insert(categories).values({
    nameEn: 'Kids', nameUr: 'بچوں کے کپڑے', slug: 'kids', sortOrder: 3,
    imageUrl: img('1503919545889-aef636e10ad4', 600),
  }).returning();
  const [acc] = await db.insert(categories).values({
    nameEn: 'Accessories', nameUr: 'لوازمات', slug: 'accessories', sortOrder: 4,
    imageUrl: img('1523170335258-f5ed11844a49', 600),
  }).returning();

  // Menswear subs
  const [kurtas] = await db.insert(categories).values({ nameEn: 'Kurtas', nameUr: 'کرتے', slug: 'kurtas', parentId: menswear.id, sortOrder: 1 }).returning();
  const [sk] = await db.insert(categories).values({ nameEn: 'Shalwar Kameez', nameUr: 'شلوار قمیض', slug: 'shalwar-kameez', parentId: menswear.id, sortOrder: 2 }).returning();
  const [waist] = await db.insert(categories).values({ nameEn: 'Waistcoats', nameUr: 'واسکٹ', slug: 'waistcoats', parentId: menswear.id, sortOrder: 3 }).returning();
  const [tees] = await db.insert(categories).values({ nameEn: 'T-Shirts', nameUr: 'ٹی شرٹس', slug: 't-shirts', parentId: menswear.id, sortOrder: 4 }).returning();

  // Womenswear subs
  const [lawn] = await db.insert(categories).values({ nameEn: 'Lawn', nameUr: 'لان', slug: 'lawn', parentId: womenswear.id, sortOrder: 1 }).returning();
  const [formal] = await db.insert(categories).values({ nameEn: 'Formal', nameUr: 'فارمل', slug: 'formal', parentId: womenswear.id, sortOrder: 2 }).returning();
  const [bridal] = await db.insert(categories).values({ nameEn: 'Bridal', nameUr: 'دلہن', slug: 'bridal', parentId: womenswear.id, sortOrder: 3 }).returning();
  const [pret] = await db.insert(categories).values({ nameEn: 'Pret', nameUr: 'پریٹ', slug: 'pret', parentId: womenswear.id, sortOrder: 4 }).returning();

  // Kids subs
  const [boys] = await db.insert(categories).values({ nameEn: 'Boys', nameUr: 'لڑکے', slug: 'boys', parentId: kids.id, sortOrder: 1 }).returning();
  const [girls] = await db.insert(categories).values({ nameEn: 'Girls', nameUr: 'لڑکیاں', slug: 'girls', parentId: kids.id, sortOrder: 2 }).returning();

  // Accessories subs
  const [bags] = await db.insert(categories).values({ nameEn: 'Bags', nameUr: 'بیگ', slug: 'bags', parentId: acc.id, sortOrder: 1 }).returning();
  const [jewel] = await db.insert(categories).values({ nameEn: 'Jewelry', nameUr: 'زیورات', slug: 'jewelry', parentId: acc.id, sortOrder: 2 }).returning();
  const [foot] = await db.insert(categories).values({ nameEn: 'Footwear', nameUr: 'جوتے', slug: 'footwear', parentId: acc.id, sortOrder: 3 }).returning();
  const [dupattas] = await db.insert(categories).values({ nameEn: 'Scarves & Dupattas', nameUr: 'دوپٹے', slug: 'scarves-dupattas', parentId: acc.id, sortOrder: 4 }).returning();

  console.log('  ✓ 18 categories');

  // ═══════════════════════════════════════════════════════════
  //  PRODUCTS  — data-driven loop
  // ═══════════════════════════════════════════════════════════

  interface P {
    catId: string; nameEn: string; nameUr: string; slug: string;
    descEn: string; descUr: string; price: string; featured: boolean;
    tags: string[];
    imgs: { u: string; a: string }[];
    colors: string[]; sizes: string[]; xlExtra?: string;
    stockMin: number; stockMax: number; lowCount?: number;
  }

  const catalog: P[] = [
    // ── Kurtas ────────────────────────────────────────
    { catId: kurtas.id, nameEn: 'Premium Cotton Kurta', nameUr: 'پریمیم کاٹن کرتا', slug: 'premium-cotton-kurta',
      descEn: 'Crafted from 100% Egyptian cotton with a relaxed fit. Features hand-stitched collar detailing and mother-of-pearl buttons. Perfect for daily wear and casual gatherings.',
      descUr: 'مصری کاٹن سے تیار کردہ آرام دہ کرتا۔ ہاتھ سے سلائی شدہ کالر اور بٹنز۔',
      price: '2500.00', featured: true,
      tags: ['cotton', 'casual', 'summer', 'bestseller'],
      imgs: [
        { u: img('1594938298603-c8148c4dae35'), a: 'Premium Cotton Kurta — White' },
        { u: img('1589363460563-a75e43bd73c3'), a: 'Cotton Kurta — Detail' },
        { u: img('1617137968427-85924c800a22'), a: 'Cotton Kurta — Side' },
      ],
      colors: ['White', 'Sky Blue', 'Beige'], sizes: ['S','M','L','XL'], xlExtra: '200.00',
      stockMin: 30, stockMax: 80 },

    { catId: kurtas.id, nameEn: 'Linen Summer Kurta', nameUr: 'لینن سمر کرتا', slug: 'linen-summer-kurta',
      descEn: 'Breathable pure linen kurta designed for Pakistani summers. Lightweight fabric with a structured silhouette that stays crisp all day.',
      descUr: 'خالص لینن سے بنا ہوا ہلکا کرتا، گرم موسم کے لیے مثالی۔',
      price: '3200.00', featured: true,
      tags: ['linen', 'summer', 'lightweight', 'premium'],
      imgs: [
        { u: img('1596755094514-5c7c0f830a8a'), a: 'Linen Summer Kurta — Front' },
        { u: img('1571945153237-4929e783af4a'), a: 'Linen Kurta — Fabric' },
      ],
      colors: ['Off White', 'Sage Green'], sizes: ['M','L','XL'], xlExtra: '300.00',
      stockMin: 20, stockMax: 50 },

    // ── Shalwar Kameez ────────────────────────────────
    { catId: sk.id, nameEn: 'Classic White Shalwar Kameez', nameUr: 'کلاسک سفید شلوار قمیض', slug: 'classic-white-shalwar-kameez',
      descEn: 'The quintessential Pakistani formal outfit. Premium wash-and-wear fabric that resists wrinkles. Includes matching shalwar with adjustable waist.',
      descUr: 'روایتی پاکستانی فارمل لباس۔ واش اینڈ ویئر کپڑا جو سلوٹ مزاحم ہے۔',
      price: '4500.00', featured: false,
      tags: ['formal', 'wash-and-wear', 'classic', 'white'],
      imgs: [
        { u: img('1617137984095-74e4e5e3613f'), a: 'Classic White Shalwar Kameez' },
        { u: img('1583743814966-8936f5b7be1a'), a: 'Shalwar Kameez — Styled' },
      ],
      colors: ['White', 'Off White'], sizes: ['S','M','L','XL'], xlExtra: '250.00',
      stockMin: 15, stockMax: 45 },

    { catId: sk.id, nameEn: 'Embroidered Eid Collection', nameUr: 'کڑھائی والا عید کلیکشن', slug: 'embroidered-eid-collection',
      descEn: 'Luxurious embroidered shalwar kameez for Eid celebrations. Intricate threadwork on neckline and cuffs with premium cotton-silk blend.',
      descUr: 'عید کے لیے خوبصورت کڑھائی والا شلوار قمیض۔ گلے اور آستینوں پر نفیس کام۔',
      price: '7800.00', featured: true,
      tags: ['eid', 'embroidered', 'festive', 'premium', 'silk-blend'],
      imgs: [
        { u: img('1610030469983-25d43e2e517e'), a: 'Embroidered Eid Collection — Front' },
        { u: img('1590736969955-71cc94901144'), a: 'Eid Collection — Full Length' },
      ],
      colors: ['Gold', 'Navy', 'Maroon'], sizes: ['M','L','XL'], xlExtra: '500.00',
      stockMin: 8, stockMax: 25, lowCount: 3 },

    // ── Waistcoats ────────────────────────────────────
    { catId: waist.id, nameEn: 'Embroidered Velvet Waistcoat', nameUr: 'کڑھائی والی مخمل واسکٹ', slug: 'embroidered-velvet-waistcoat',
      descEn: 'Handcrafted velvet waistcoat with gold zari embroidery. Perfect layering piece for weddings and formal events. Fully lined with satin.',
      descUr: 'سونے کی زری کڑھائی والی مخمل واسکٹ۔ شادیوں اور تقریبات کے لیے مثالی۔',
      price: '5500.00', featured: true,
      tags: ['wedding', 'velvet', 'embroidered', 'formal', 'handcrafted'],
      imgs: [
        { u: img('1593030761757-71fae8498d0e'), a: 'Velvet Waistcoat — Black' },
        { u: img('1507003211169-0a1dd7228f2d'), a: 'Waistcoat — Styled' },
      ],
      colors: ['Black', 'Maroon', 'Navy'], sizes: ['S','M','L','XL'], xlExtra: '350.00',
      stockMin: 10, stockMax: 30 },

    // ── T-Shirts ──────────────────────────────────────
    { catId: tees.id, nameEn: 'Casual Polo T-Shirt', nameUr: 'کیژول پولو ٹی شرٹ', slug: 'casual-polo-tshirt',
      descEn: 'Premium pique cotton polo with ribbed collar and cuffs. Relaxed fit with side vents. Available in solid colours.',
      descUr: 'اعلیٰ معیار کی پیکے کاٹن پولو۔ آرام دہ فٹ۔',
      price: '1800.00', featured: false,
      tags: ['casual', 'cotton', 'polo', 'everyday'],
      imgs: [
        { u: img('1521572163474-6864f9cf17ab'), a: 'Polo T-Shirt — Navy' },
        { u: img('1586790170083-2f9ceadc732d'), a: 'Polo — Detail' },
      ],
      colors: ['Navy', 'White', 'Olive', 'Black'], sizes: ['S','M','L','XL','XXL'], xlExtra: '100.00',
      stockMin: 40, stockMax: 100 },

    // ── Lawn ──────────────────────────────────────────
    { catId: lawn.id, nameEn: 'Embroidered Lawn 3-Piece', nameUr: 'کڑھائی والا لان تھری پیس', slug: 'embroidered-lawn-3piece',
      descEn: 'Stunning 3-piece lawn suit — digital print shirt with embroidered neckline, dyed cambric trouser, and chiffon printed dupatta. A summer wardrobe essential.',
      descUr: 'خوبصورت تھری پیس لان سوٹ۔ ڈیجیٹل پرنٹ شرٹ، کیمبرک ٹراؤزر اور شفون دوپٹہ۔',
      price: '4200.00', featured: true,
      tags: ['lawn', 'summer', '3-piece', 'embroidered', 'digital-print'],
      imgs: [
        { u: img('1583391733956-6c78276477e2'), a: 'Lawn 3-Piece — Front' },
        { u: img('1487412720507-e7ab37603c6f'), a: 'Lawn Suit — Styled' },
        { u: img('1594938298603-c8148c4dae35'), a: 'Lawn — Fabric' },
      ],
      colors: ['Teal', 'Coral', 'Lilac'], sizes: ['S','M','L'],
      stockMin: 15, stockMax: 40 },

    // ── Formal ────────────────────────────────────────
    { catId: formal.id, nameEn: 'Silk Formal Gown', nameUr: 'ریشمی فارمل گاؤن', slug: 'silk-formal-gown',
      descEn: 'Exquisite pure silk gown with hand-embellished bodice. Floor-length design with a structured silhouette for formal evening events.',
      descUr: 'خالص ریشمی گاؤن ہاتھ سے سجاوٹ کے ساتھ۔ فارمل تقریبات کے لیے مثالی۔',
      price: '18500.00', featured: true,
      tags: ['silk', 'formal', 'evening', 'luxury', 'hand-embellished'],
      imgs: [
        { u: img('1566174053879-31528523f8ae'), a: 'Silk Formal Gown' },
        { u: img('1518611012118-696072aa579a'), a: 'Formal Gown — Detail' },
      ],
      colors: ['Emerald', 'Burgundy', 'Midnight Blue'], sizes: ['S','M','L'],
      stockMin: 5, stockMax: 15, lowCount: 4 },

    // ── Bridal ────────────────────────────────────────
    { catId: bridal.id, nameEn: 'Bridal Lehenga Set', nameUr: 'دلہن لہنگا سیٹ', slug: 'bridal-lehenga-set',
      descEn: 'Handcrafted bridal lehenga with intricate zardozi and dabka work. Heavy raw silk with cancan lining. Includes blouse and net dupatta with four-sided border.',
      descUr: 'ہاتھ سے تیار دلہن لہنگا، زردوزی اور ڈبکا کام۔ خام ریشم۔',
      price: '45000.00', featured: true,
      tags: ['bridal', 'wedding', 'lehenga', 'zardozi', 'luxury', 'handcrafted'],
      imgs: [
        { u: img('1610030469983-25d43e2e517e'), a: 'Bridal Lehenga — Red' },
        { u: img('1519699047748-de8e457a634e'), a: 'Lehenga — Embroidery' },
        { u: img('1583391733956-6c78276477e2'), a: 'Lehenga — Full View' },
        { u: img('1515372039744-b8f02a3ae446'), a: 'Lehenga — Dupatta' },
      ],
      colors: ['Red', 'Maroon', 'Royal Blue'], sizes: ['S','M','L'],
      stockMin: 2, stockMax: 8, lowCount: 5 },

    // ── Pret ──────────────────────────────────────────
    { catId: pret.id, nameEn: 'Cotton Pret Kurti', nameUr: 'کاٹن پریٹ کرتی', slug: 'cotton-pret-kurti',
      descEn: 'Ready-to-wear cotton kurti with block print design. A-line silhouette with side pockets. Effortless everyday style.',
      descUr: 'بلاک پرنٹ کاٹن کرتی۔ اے لائن ڈیزائن۔ روزمرہ کے لیے مثالی۔',
      price: '2200.00', featured: false,
      tags: ['pret', 'cotton', 'casual', 'block-print', 'everyday'],
      imgs: [
        { u: img('1487412720507-e7ab37603c6f'), a: 'Cotton Pret Kurti' },
        { u: img('1594938298603-c8148c4dae35'), a: 'Pret Kurti — Detail' },
      ],
      colors: ['Mustard', 'Indigo', 'Rust', 'Olive'], sizes: ['XS','S','M','L'],
      stockMin: 25, stockMax: 60 },

    { catId: pret.id, nameEn: 'Chiffon Party Wear', nameUr: 'شفون پارٹی ویئر', slug: 'chiffon-party-wear',
      descEn: 'Elegant chiffon party dress with pearl embellishments and sequin border. Flared sleeves with cinched waist. Perfect for mehndis and dawats.',
      descUr: 'موتیوں اور سیکوئن سے سجی شفون پارٹی ڈریس۔ مہندی اور دعوتوں کے لیے۔',
      price: '6800.00', featured: true,
      tags: ['party', 'chiffon', 'sequin', 'mehndi', 'festive'],
      imgs: [
        { u: img('1518611012118-696072aa579a'), a: 'Chiffon Party Wear' },
        { u: img('1566174053879-31528523f8ae'), a: 'Party Wear — Back' },
      ],
      colors: ['Blush Pink', 'Sea Green', 'Lavender'], sizes: ['S','M','L'],
      stockMin: 8, stockMax: 20 },

    // ── Boys ──────────────────────────────────────────
    { catId: boys.id, nameEn: 'Boys Kurta Pajama Set', nameUr: 'لڑکوں کا کرتا پاجامہ سیٹ', slug: 'boys-kurta-pajama-set',
      descEn: 'Adorable kurta pajama set for young boys. Soft cotton fabric with contrast piping. Machine washable.',
      descUr: 'لڑکوں کے لیے خوبصورت کرتا پاجامہ سیٹ۔ نرم کاٹن کپڑا۔',
      price: '1500.00', featured: false,
      tags: ['kids', 'boys', 'kurta', 'eid', 'cotton'],
      imgs: [
        { u: img('1503919545889-aef636e10ad4'), a: 'Boys Kurta Pajama Set' },
        { u: img('1519457431-44ccd64a579b'), a: 'Boys Kurta — Detail' },
      ],
      colors: ['White', 'Light Blue'], sizes: ['2-3Y','4-5Y','6-7Y','8-9Y'],
      stockMin: 20, stockMax: 50 },

    // ── Girls ─────────────────────────────────────────
    { catId: girls.id, nameEn: 'Girls Embroidered Frock', nameUr: 'لڑکیوں کا کڑھائی والا فراک', slug: 'girls-embroidered-frock',
      descEn: 'Pretty embroidered frock with tulle underskirt. Floral embroidery on bodice with matching ribbon belt. Perfect for parties and Eid.',
      descUr: 'لڑکیوں کے لیے خوبصورت کڑھائی والا فراک۔ پارٹیوں اور عید کے لیے مثالی۔',
      price: '2800.00', featured: true,
      tags: ['kids', 'girls', 'frock', 'embroidered', 'party', 'eid'],
      imgs: [
        { u: img('1519457431-44ccd64a579b'), a: 'Girls Frock — Pink' },
        { u: img('1503919545889-aef636e10ad4'), a: 'Girls Frock — Detail' },
      ],
      colors: ['Pink', 'Peach', 'White'], sizes: ['2-3Y','4-5Y','6-7Y','8-9Y'],
      stockMin: 15, stockMax: 35 },

    // ── Bags ──────────────────────────────────────────
    { catId: bags.id, nameEn: 'Leather Crossbody Bag', nameUr: 'چمڑے کا کراس باڈی بیگ', slug: 'leather-crossbody-bag',
      descEn: 'Genuine full-grain leather crossbody with adjustable strap. Multiple compartments including secure zip pocket. Handstitched detailing.',
      descUr: 'اصلی چمڑے کا کراس باڈی بیگ۔ ایڈجسٹ ایبل پٹی اور متعدد خانے۔',
      price: '4800.00', featured: true,
      tags: ['leather', 'bag', 'crossbody', 'handmade', 'everyday'],
      imgs: [
        { u: img('1548036328-c9fa89d128fa'), a: 'Crossbody Bag — Tan' },
        { u: img('1523170335258-f5ed11844a49'), a: 'Crossbody — Interior' },
        { u: img('1547949003-9a90e1cf4a0f'), a: 'Crossbody — Styled' },
      ],
      colors: ['Tan', 'Brown', 'Black'], sizes: ['One Size'],
      stockMin: 10, stockMax: 30 },

    { catId: bags.id, nameEn: 'Embroidered Evening Clutch', nameUr: 'کڑھائی والا کلچ', slug: 'embroidered-evening-clutch',
      descEn: 'Stunning handcrafted clutch with zardozi embroidery on velvet. Gold-tone chain strap included. The perfect finishing touch for formal occasions.',
      descUr: 'مخمل پر زردوزی کڑھائی والا کلچ۔ تقریبات کے لیے مثالی۔',
      price: '3200.00', featured: false,
      tags: ['clutch', 'evening', 'embroidered', 'velvet', 'wedding'],
      imgs: [
        { u: img('1566150905458-c3b8f78e9fce'), a: 'Evening Clutch — Gold' },
        { u: img('1548036328-c9fa89d128fa'), a: 'Clutch — Detail' },
      ],
      colors: ['Gold', 'Silver', 'Red'], sizes: ['One Size'],
      stockMin: 8, stockMax: 20 },

    // ── Jewelry ───────────────────────────────────────
    { catId: jewel.id, nameEn: 'Kundan Jewelry Set', nameUr: 'کندن زیورات سیٹ', slug: 'kundan-jewelry-set',
      descEn: 'Traditional kundan set — necklace, earrings, and tikka. Gold-plated base with polki stones and meenakari work.',
      descUr: 'روایتی کندن زیورات سیٹ۔ ہار، بالیاں اور ٹیکا۔ سونے کی پلیٹنگ۔',
      price: '8500.00', featured: true,
      tags: ['jewelry', 'kundan', 'gold-plated', 'bridal', 'traditional', 'set'],
      imgs: [
        { u: img('1515562141207-7a88fb7ce338'), a: 'Kundan Set — Full' },
        { u: img('1535632066927-ab7c9ab60908'), a: 'Kundan Necklace — Close Up' },
        { u: img('1599643478518-a784e5dc4c8f'), a: 'Kundan Earrings' },
      ],
      colors: ['Gold/Green', 'Gold/Red', 'Gold/Blue'], sizes: ['One Size'],
      stockMin: 5, stockMax: 15, lowCount: 2 },

    // ── Footwear ──────────────────────────────────────
    { catId: foot.id, nameEn: 'Peshawari Chappal', nameUr: 'پشاوری چپل', slug: 'peshawari-chappal',
      descEn: 'Authentic handmade Peshawari chappal in genuine leather. Traditional cross-strap design with comfortable sole. Made by artisans in Peshawar.',
      descUr: 'اصلی پشاوری چپل۔ ہاتھ سے بنی ہوئی، خالص چمڑا۔ پشاور کے کاریگروں کی کاریگری۔',
      price: '1800.00', featured: false,
      tags: ['footwear', 'chappal', 'leather', 'handmade', 'traditional'],
      imgs: [
        { u: img('1542291026-7eec264c27ff'), a: 'Peshawari Chappal — Brown' },
        { u: img('1560343090-f0409e92791a'), a: 'Chappal — Detail' },
      ],
      colors: ['Brown', 'Tan'], sizes: ['7','8','9','10','11'],
      stockMin: 15, stockMax: 40 },

    { catId: foot.id, nameEn: 'Kolhapuri Sandals', nameUr: 'کولہاپوری سینڈل', slug: 'kolhapuri-sandals',
      descEn: 'Classic Kolhapuri-style leather sandals with hand-braided straps. Vegetable-tanned leather that softens beautifully with wear.',
      descUr: 'کلاسک کولہاپوری سٹائل چمڑے کے سینڈل۔ قدرتی طریقے سے رنگا ہوا چمڑا۔',
      price: '2400.00', featured: false,
      tags: ['footwear', 'sandals', 'leather', 'kolhapuri', 'handmade'],
      imgs: [
        { u: img('1560343090-f0409e92791a'), a: 'Kolhapuri — Natural' },
        { u: img('1542291026-7eec264c27ff'), a: 'Kolhapuri — Styled' },
      ],
      colors: ['Natural', 'Dark Brown'], sizes: ['6','7','8','9','10'],
      stockMin: 10, stockMax: 25 },

    // ── Scarves / Dupattas ────────────────────────────
    { catId: dupattas.id, nameEn: 'Silk Dupatta', nameUr: 'ریشمی دوپٹہ', slug: 'silk-dupatta',
      descEn: 'Pure silk dupatta with delicate self-print. Hand-rolled edges. Versatile piece that pairs with any outfit.',
      descUr: 'خالص ریشمی دوپٹہ۔ ہاتھ سے تیار کنارے۔ ہر لباس کے ساتھ خوبصورت۔',
      price: '3500.00', featured: false,
      tags: ['silk', 'dupatta', 'scarf', 'luxury', 'versatile'],
      imgs: [
        { u: img('1515372039744-b8f02a3ae446'), a: 'Silk Dupatta — Draped' },
        { u: img('1583391733956-6c78276477e2'), a: 'Silk Dupatta — Folded' },
      ],
      colors: ['Ivory', 'Blush', 'Teal', 'Gold'], sizes: ['One Size'],
      stockMin: 12, stockMax: 30 },
  ];

  let pCount = 0;
  let vCount = 0;
  const featuredIds: string[] = [];

  for (const p of catalog) {
    const [prod] = await db.insert(products).values({
      categoryId: p.catId, nameEn: p.nameEn, nameUr: p.nameUr, slug: p.slug,
      descriptionEn: p.descEn, descriptionUr: p.descUr,
      basePricePkr: p.price, isFeatured: p.featured,
    }).returning();

    if (p.featured) featuredIds.push(prod.id);

    // Images
    for (let i = 0; i < p.imgs.length; i++) {
      await db.insert(productImages).values({
        productId: prod.id, url: p.imgs[i].u, altText: p.imgs[i].a,
        isPrimary: i === 0, sortOrder: i,
      });
    }

    // Tags
    if (p.tags.length) {
      await db.insert(productTags).values(p.tags.map((t) => ({ productId: prod.id, tag: t })));
    }

    // Variants + Inventory
    let vi = 0;
    for (const color of p.colors) {
      for (const size of p.sizes) {
        const slugPart = p.slug.slice(0, 12).toUpperCase().replace(/-/g, '');
        const colPart = color.slice(0, 3).toUpperCase().replace(/\s/g, '');
        const szPart = size.replace(/\s/g, '').toUpperCase();
        const sku = `${slugPart}-${colPart}-${szPart}`;
        const isXL = size === 'XL' || size === 'XXL';
        const extra = isXL && p.xlExtra ? p.xlExtra : '0';

        const [variant] = await db.insert(productVariants).values({
          productId: prod.id, sku, color, size, extraPricePkr: extra,
        }).returning();

        const isLow = p.lowCount !== undefined && vi < p.lowCount;
        const onHand = isLow
          ? Math.floor(1 + Math.random() * 4)
          : Math.floor(p.stockMin + Math.random() * (p.stockMax - p.stockMin));
        const reserved = isLow
          ? Math.min(onHand, Math.floor(Math.random() * 2))
          : Math.floor(Math.random() * Math.min(5, onHand));

        await db.insert(inventory).values({
          variantId: variant.id, quantityOnHand: onHand,
          quantityReserved: reserved, lowStockThreshold: 5,
        });

        vCount++;
        vi++;
      }
    }
    pCount++;
  }

  console.log(`  ✓ ${pCount} products, ${vCount} variants (with images + tags + inventory)`);

  // ═══════════════════════════════════════════════════════════
  //  DELIVERY ZONES  (15)
  // ═══════════════════════════════════════════════════════════

  await db.insert(deliveryZones).values([
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
    { city: 'Sialkot', province: 'Punjab', shippingChargePkr: '200.00', estimatedDays: 3, isCodAvailable: true },
    { city: 'Gujranwala', province: 'Punjab', shippingChargePkr: '200.00', estimatedDays: 3, isCodAvailable: true },
    { city: 'Sukkur', province: 'Sindh', shippingChargePkr: '280.00', estimatedDays: 4, isCodAvailable: true },
    { city: 'Mardan', province: 'KPK', shippingChargePkr: '280.00', estimatedDays: 4, isCodAvailable: true },
    { city: 'Abbottabad', province: 'KPK', shippingChargePkr: '300.00', estimatedDays: 4, isCodAvailable: true },
  ]);
  console.log('  ✓ 15 delivery zones');

  // ═══════════════════════════════════════════════════════════
  //  COUPONS  (7)
  // ═══════════════════════════════════════════════════════════

  await db.insert(coupons).values([
    { code: 'WELCOME10', discountType: 'percentage', discountValue: '10.00', minOrderPkr: '1000.00', maxDiscountPkr: '500.00', maxUses: 1000, isActive: true },
    { code: 'EID2026', discountType: 'flat_pkr', discountValue: '500.00', minOrderPkr: '3000.00', maxUses: 500, isActive: true },
    { code: 'FREESHIP', discountType: 'flat_pkr', discountValue: '200.00', minOrderPkr: '2000.00', maxUses: null, isActive: true },
    { code: 'SUMMER25', discountType: 'percentage', discountValue: '25.00', minOrderPkr: '2500.00', maxDiscountPkr: '1500.00', maxUses: 200, isActive: true },
    { code: 'VIP500', discountType: 'flat_pkr', discountValue: '500.00', minOrderPkr: '5000.00', maxUses: 100, isActive: true },
    { code: 'FIRST15', discountType: 'percentage', discountValue: '15.00', minOrderPkr: '1500.00', maxDiscountPkr: '750.00', maxUses: 300, isActive: true },
    { code: 'EXPIRED20', discountType: 'percentage', discountValue: '20.00', minOrderPkr: '1000.00', maxUses: 50, isActive: false },
  ]);
  console.log('  ✓ 7 coupons');

  // ═══════════════════════════════════════════════════════════
  //  BANNERS  (5)
  // ═══════════════════════════════════════════════════════════

  await db.insert(banners).values([
    { title: 'Eid Collection 2026', imageUrl: img('1610030469983-25d43e2e517e', 1600), linkUrl: '/categories/formal', placement: 'hero', sortOrder: 1 },
    { title: 'Summer Lawn Sale — Up to 50% Off', imageUrl: img('1487412720507-e7ab37603c6f', 1600), linkUrl: '/categories/lawn', placement: 'hero', sortOrder: 2 },
    { title: 'Bridal Season — Book Your Consultation', imageUrl: img('1519699047748-de8e457a634e', 1600), linkUrl: '/categories/bridal', placement: 'hero', sortOrder: 3 },
    { title: 'Free Delivery on Orders Above Rs. 3000', imageUrl: img('1556742049-0cfed4f6a45d', 1600), linkUrl: '/products', placement: 'category_top', sortOrder: 1 },
    { title: 'New Arrivals — Menswear', imageUrl: img('1507003211169-0a1dd7228f2d', 1600), linkUrl: '/categories/menswear', placement: 'category_top', sortOrder: 2 },
  ]);
  console.log('  ✓ 5 banners');

  // ═══════════════════════════════════════════════════════════
  //  FLASH SALES  (2 with products)
  // ═══════════════════════════════════════════════════════════

  const now = new Date();
  const [summer] = await db.insert(flashSales).values({
    name: 'Summer Clearance', discountType: 'percentage', discountValue: '20.00',
    startsAt: new Date(now.getTime() - 7 * 864e5),
    endsAt: new Date(now.getTime() + 14 * 864e5), isActive: true,
  }).returning();

  const [eid] = await db.insert(flashSales).values({
    name: 'Eid Special Preview', discountType: 'percentage', discountValue: '15.00',
    startsAt: new Date(now.getTime() + 30 * 864e5),
    endsAt: new Date(now.getTime() + 45 * 864e5), isActive: true,
  }).returning();

  if (featuredIds.length >= 4) {
    await db.insert(flashSaleProducts).values([
      { flashSaleId: summer.id, productId: featuredIds[0], stockLimit: 50 },
      { flashSaleId: summer.id, productId: featuredIds[1], stockLimit: 30 },
      { flashSaleId: summer.id, productId: featuredIds[2], stockLimit: 20 },
      { flashSaleId: eid.id, productId: featuredIds[3], stockLimit: 15 },
      { flashSaleId: eid.id, productId: featuredIds[1], overridePricePkr: '2500.00', stockLimit: 25 },
    ]);
  }
  console.log('  ✓ 2 flash sales');

  // ═══════════════════════════════════════════════════════════
  //  NOTIFICATION TEMPLATES  (7)
  // ═══════════════════════════════════════════════════════════

  await db.insert(notificationTemplates).values([
    { key: 'order_confirmed', channel: 'sms', body: 'Shukriya! Your order #{{orderNumber}} is confirmed. Total: Rs. {{total}}. We\'ll notify you when it ships.' },
    { key: 'order_shipped', channel: 'sms', body: 'Great news! Order #{{orderNumber}} shipped via {{courierName}}. Tracking: {{trackingNumber}}. Delivery in ~{{estimatedDays}} days.' },
    { key: 'order_delivered', channel: 'sms', body: 'Your order #{{orderNumber}} has been delivered. We hope you love it! Rate us on our app.' },
    { key: 'order_confirmed_email', channel: 'email', subject: 'Order Confirmed — #{{orderNumber}}',
      body: '<h2>Order Confirmed!</h2><p>Dear {{customerName}},</p><p>Thank you for your order <strong>#{{orderNumber}}</strong>. Total: <strong>Rs. {{total}}</strong></p><p>We\'re preparing your items.</p>' },
    { key: 'order_shipped_email', channel: 'email', subject: 'Your Order Has Shipped — #{{orderNumber}}',
      body: '<h2>Your order is on its way!</h2><p>Order <strong>#{{orderNumber}}</strong> shipped via <strong>{{courierName}}</strong>. Tracking: <strong>{{trackingNumber}}</strong></p>' },
    { key: 'welcome', channel: 'email', subject: 'Welcome to Cover',
      body: '<h2>Khush Amdeed!</h2><p>Dear {{customerName}},</p><p>Welcome to Cover. Use code <strong>WELCOME10</strong> for 10% off your first order!</p>' },
    { key: 'otp_verification', channel: 'sms', body: 'Your Cover verification code is {{otpCode}}. Valid for 5 minutes. Do not share.' },
  ]);
  console.log('  ✓ 7 notification templates');

  // ═══════════════════════════════════════════════════════════
  //  APP SETTINGS  (10)
  // ═══════════════════════════════════════════════════════════

  await db.insert(appSettings).values([
    { key: 'cod_enabled', value: true, description: 'Enable Cash on Delivery' },
    { key: 'min_order_pkr', value: 500, description: 'Minimum order amount (PKR)' },
    { key: 'cod_charge_pkr', value: 50, description: 'COD handling fee (PKR)' },
    { key: 'maintenance_mode', value: false, description: 'Enable maintenance mode' },
    { key: 'loyalty_points_per_100_pkr', value: 1, description: 'Points earned per Rs. 100' },
    { key: 'free_shipping_threshold_pkr', value: 3000, description: 'Free shipping above (PKR)' },
    { key: 'max_return_days', value: 7, description: 'Days allowed for returns' },
    { key: 'store_name', value: 'Cover', description: 'Store display name' },
    { key: 'store_phone', value: '+92-300-1234567', description: 'Customer service phone' },
    { key: 'store_email', value: 'support@cover.pk', description: 'Customer service email' },
  ]);
  console.log('  ✓ 10 app settings');

  // ═══════════════════════════════════════════════════════════
  //  CATEGORY SEO  (4)
  // ═══════════════════════════════════════════════════════════

  for (const { cat, title, desc } of [
    { cat: menswear, title: 'Men\'s Clothing — Kurtas, Shalwar Kameez & More | Cover', desc: 'Shop premium Pakistani menswear. Free delivery over Rs. 3000.' },
    { cat: womenswear, title: 'Women\'s Fashion — Lawn, Formal & Bridal | Cover', desc: 'Discover latest women\'s fashion. New arrivals weekly.' },
    { cat: kids, title: 'Kids Clothing — Boys & Girls | Cover', desc: 'Adorable kids clothing. Comfortable fabrics, easy care.' },
    { cat: acc, title: 'Accessories — Bags, Jewelry & Footwear | Cover', desc: 'Complete your look with premium accessories.' },
  ]) {
    await db.insert(categorySeo).values({ categoryId: cat.id, metaTitle: title, metaDescription: desc, robots: 'index,follow' });
  }
  console.log('  ✓ 4 category SEO entries');

  // ═══════════════════════════════════════════════════════════

  console.log(`\n✅ Done! ${pCount} products · ${vCount} variants · 15 zones · 7 coupons · 5 banners · 2 flash sales · 7 templates · 10 settings`);
}

seed().catch(console.error);
