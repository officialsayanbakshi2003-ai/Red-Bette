// Seeds the catalogue, starter coupons and the first admin account.
// Safe to re-run: everything is upserted by its unique key.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const rupees = (r: number) => r * 100;

const categories = [
  { slug: "hoodies", name: "Hoodies", description: "400 GSM heavyweight hoodies with bold, hand-drawn art.", sortOrder: 1 },
  { slug: "oversized-tees", name: "Oversized Tees", description: "240 GSM boxy tees built for everyday wear.", sortOrder: 2 },
  { slug: "sweatshirts", name: "Sweatshirts", description: "Clean crewnecks in brushed-back fleece.", sortOrder: 3 },
  { slug: "joggers", name: "Joggers", description: "Relaxed joggers that match every drop.", sortOrder: 4 },
  { slug: "accessories", name: "Accessories", description: "Caps, totes and the finishing touches.", sortOrder: 5 },
];

const HOODIE_DETAILS = [
  "400 GSM brushed-back cotton fleece",
  "Oversized fit with dropped shoulders",
  "High-density puff + HD screen print",
  "Double-lined hood with red metal-tipped drawcords",
  "Pre-shrunk · Machine wash cold, inside out",
  "Designed & made in India",
];
const TEE_DETAILS = [
  "240 GSM combed cotton jersey",
  "Boxy oversized fit, dropped shoulders",
  "Ribbed crew neck that keeps its shape",
  "Crack-resistant screen print",
  "Pre-shrunk · Machine wash cold, inside out",
  "Designed & made in India",
];
const CREW_DETAILS = [
  "360 GSM brushed-back cotton fleece",
  "Relaxed fit with ribbed cuffs and hem",
  "Screen-printed and embroidered details",
  "Pre-shrunk · Machine wash cold, inside out",
  "Designed & made in India",
];

type Seed = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  images: string[];
  description: string;
  details: string[];
  tags: string[];
  featured?: boolean;
  color: string;
  sizes: string[];
  stock?: Partial<Record<string, number>>;
  skuPrefix: string;
};

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_STOCK: Record<string, number> = { XS: 6, S: 18, M: 30, L: 30, XL: 18, XXL: 8, OS: 40 };

const products: Seed[] = [
  {
    slug: "crimson-splash-hoodie",
    name: "Crimson Splash Hoodie",
    category: "hoodies",
    price: rupees(2499),
    compareAt: rupees(2999),
    images: [
      "/images/crimson-splash-hoodie-studio-back.webp",
      "/images/crimson-splash-hoodie-front.webp",
      "/images/crimson-splash-hoodie-back.webp",
      "/images/lookbook-betta-hoodie-model.webp",
    ],
    description:
      "Our signature piece. A crimson betta bursts through a wave of silver water across the back, with a matching fish wrapping the front hem and sleeve. Heavy, soft and built to be lived in.",
    details: HOODIE_DETAILS,
    tags: ["new", "bestseller", "betta"],
    featured: true,
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-HD-CSP",
  },
  {
    slug: "blood-moon-hoodie",
    name: "Blood Moon Hoodie",
    category: "hoodies",
    price: rupees(2799),
    compareAt: rupees(3299),
    images: ["/images/blood-moon-hoodie-back.webp", "/images/blood-moon-hoodie-front.webp"],
    description:
      "A betta rises against a blood-red moon, split by a line of still water. Finished with a red hood stripe and a vertical sleeve print.",
    details: HOODIE_DETAILS,
    tags: ["new", "limited", "betta"],
    featured: true,
    color: "Black",
    sizes: APPAREL_SIZES,
    stock: { XS: 0, XXL: 3 },
    skuPrefix: "RB-HD-BMN",
  },
  {
    slug: "made-to-flow-alone-hoodie",
    name: "Made To Flow Alone Hoodie",
    category: "hoodies",
    price: rupees(2699),
    images: ["/images/made-to-flow-alone-hoodie-back.webp", "/images/made-to-flow-alone-hoodie-front.webp"],
    description:
      "For the ones who move on their own terms. A red moon over jagged peaks, with the Made To Flow Alone manifesto stacked across the back.",
    details: HOODIE_DETAILS,
    tags: ["mountains"],
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-HD-MFA",
  },
  {
    slug: "red-widow-hoodie",
    name: "Red Widow Hoodie",
    category: "hoodies",
    price: rupees(2799),
    images: ["/images/red-widow-hoodie-back.webp", "/images/red-widow-hoodie-front.webp"],
    description:
      "Dark, sharp and unmistakable. A widow spider hangs in a red web across the back, crossing onto the chest and sleeve. The loudest piece in the drop.",
    details: HOODIE_DETAILS,
    tags: ["new", "limited"],
    featured: true,
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-HD-RWD",
  },
  {
    slug: "different-route-hoodie",
    name: "Different Route Hoodie",
    category: "hoodies",
    price: rupees(2599),
    images: ["/images/different-route-hoodie-back.webp", "/images/different-route-hoodie-front.webp"],
    description:
      "Different route, same destination. A crimson ridge climbs the back under a low red sun, with the Red Betta mark running down the spine.",
    details: HOODIE_DETAILS,
    tags: ["mountains"],
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-HD-DRT",
  },
  {
    slug: "flow-your-way-oversized-tee",
    name: "Flow Your Way Oversized Tee",
    category: "oversized-tees",
    price: rupees(1299),
    compareAt: rupees(1599),
    images: [],
    description: "The motto, loud and clear. Big italic back print, clean chest logo, heavyweight boxy fit.",
    details: TEE_DETAILS,
    tags: ["bestseller"],
    featured: true,
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-TE-FYW",
  },
  {
    slug: "betta-mark-tee-bone",
    name: "Betta Mark Tee (Bone)",
    category: "oversized-tees",
    price: rupees(1199),
    images: [],
    description: "Our crimson betta mark, printed big on an off-white bone tee. Minimal back with the tagline.",
    details: TEE_DETAILS,
    tags: ["new", "betta"],
    featured: true,
    color: "Bone",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-TE-BMB",
  },
  {
    slug: "red-moon-oversized-tee",
    name: "Red Moon Oversized Tee",
    category: "oversized-tees",
    price: rupees(1399),
    images: [],
    description: "A betta circling a red moon, surrounded by rising bubbles. Oversized, heavyweight, easy.",
    details: TEE_DETAILS,
    tags: ["betta"],
    color: "Black",
    sizes: APPAREL_SIZES,
    stock: { M: 2 },
    skuPrefix: "RB-TE-RMN",
  },
  {
    slug: "signature-logo-tee",
    name: "Signature Logo Tee",
    category: "oversized-tees",
    price: rupees(999),
    images: [],
    description: "The essential. Small betta on the chest, full RED BETTA wordmark on the back.",
    details: TEE_DETAILS,
    tags: ["essential"],
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-TE-SIG",
  },
  {
    slug: "crimson-tide-crewneck",
    name: "Crimson Tide Crewneck",
    category: "sweatshirts",
    price: rupees(2199),
    images: [],
    description: "A betta riding a silver tide across the front, with a vertical tagline down the sleeve.",
    details: CREW_DETAILS,
    tags: ["betta"],
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-SW-CTD",
  },
  {
    slug: "stealth-crewneck",
    name: "Stealth Crewneck",
    category: "sweatshirts",
    price: rupees(1999),
    images: [],
    description: "All black, tonal everything. A quiet logo on the chest and a shadow betta on the back.",
    details: CREW_DETAILS,
    tags: ["essential"],
    color: "Black",
    sizes: APPAREL_SIZES,
    skuPrefix: "RB-SW-STL",
  },
  {
    slug: "flow-joggers",
    name: "Flow Joggers",
    category: "joggers",
    price: rupees(1799),
    images: [],
    description: "Relaxed tapered joggers with crimson side stripes and red-tipped drawcords.",
    details: [
      "320 GSM brushed-back cotton fleece",
      "Relaxed tapered fit, ribbed cuffs",
      "Two side pockets, one back pocket",
      "Elastic waist with red-tipped drawcords",
      "Designed & made in India",
    ],
    tags: ["essential"],
    color: "Black",
    sizes: ["S", "M", "L", "XL", "XXL"],
    skuPrefix: "RB-JG-FLW",
  },
  {
    slug: "betta-cap",
    name: "Betta Cap",
    category: "accessories",
    price: rupees(799),
    images: [],
    description: "Six-panel cap with an embroidered crimson betta. Adjustable strap, one size.",
    details: ["100% cotton twill", "Embroidered front mark", "Adjustable strap", "One size fits most"],
    tags: ["accessory"],
    color: "Black",
    sizes: ["OS"],
    skuPrefix: "RB-AC-CAP",
  },
  {
    slug: "flow-tote",
    name: "Flow Tote",
    category: "accessories",
    price: rupees(699),
    images: [],
    description: "Heavy canvas tote with the full Red Betta mark. Carries a laptop and then some.",
    details: ["12 oz natural cotton canvas", "Reinforced black handles", "Inner pocket", "40 × 38 cm"],
    tags: ["accessory"],
    color: "Bone",
    sizes: ["OS"],
    skuPrefix: "RB-AC-TOT",
  },
];

// Bump when the seeded catalogue copy/images change. Existing stores get the
// new values once; after that, edits made in the admin are never overwritten.
const CATALOG_VERSION = 4;

async function main() {
  const versionRow = await db.siteSetting.findUnique({ where: { key: "seed.catalogVersion" } });
  const applyCatalogUpdate = Number(versionRow?.value ?? 0) < CATALOG_VERSION;

  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: applyCatalogUpdate ? { name: c.name, description: c.description } : {},
      create: c,
    });
    categoryIds.set(c.slug, row.id);
  }

  for (const p of products) {
    const data = {
      name: p.name,
      description: p.description,
      details: p.details,
      price: p.price,
      compareAtPrice: p.compareAt ?? null,
      images: p.images,
      tags: p.tags,
      isFeatured: p.featured ?? false,
      isActive: true,
      categoryId: categoryIds.get(p.category)!,
    };
    const { name, description, details, images } = data;
    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: applyCatalogUpdate ? { name, description, details, images } : {},
      create: { slug: p.slug, ...data },
    });
    for (const size of p.sizes) {
      const sku = `${p.skuPrefix}-${size}`;
      const stock = p.stock?.[size] ?? DEFAULT_STOCK[size] ?? 10;
      await db.productVariant.upsert({
        where: { sku },
        update: {},
        create: { productId: product.id, size, color: p.color, sku, stock },
      });
    }
  }

  const coupons = [
    { code: "WELCOME10", description: "10% off your first order (up to ₹500)", type: "PERCENT" as const, value: 10, minSubtotal: rupees(999), maxDiscount: rupees(500) },
    { code: "FLOW200", description: "₹200 off orders above ₹1,999", type: "FIXED" as const, value: rupees(200), minSubtotal: rupees(1999) },
    { code: "BETTA15", description: "15% off orders above ₹2,999 (up to ₹750)", type: "PERCENT" as const, value: 15, minSubtotal: rupees(2999), maxDiscount: rupees(750) },
  ];
  for (const c of coupons) {
    await db.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  await db.siteSetting.upsert({
    where: { key: "seed.catalogVersion" },
    update: { value: String(CATALOG_VERSION) },
    create: { key: "seed.catalogVersion", value: String(CATALOG_VERSION) },
  });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
    const existing = await db.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      await db.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
      console.log(`✓ ${adminEmail} is an admin (password unchanged)`);
    } else {
      await db.user.create({
        data: {
          email: adminEmail,
          name: "Store Admin",
          role: "ADMIN",
          passwordHash: await bcrypt.hash(adminPassword, 12),
        },
      });
      console.log(`✓ Created admin ${adminEmail}`);
    }
  } else {
    console.log("• ADMIN_EMAIL / ADMIN_PASSWORD not set, skipped creating an admin account.");
  }

  console.log(`✓ Seeded ${categories.length} categories, ${products.length} products, ${coupons.length} coupons`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
