import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============ USERS ============
  const adminEmail = 'admin@habeshan.de';
  const vendorEmail = 'vendor@habeshan.de';
  const customerEmail = 'customer@demo.de';

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash('Admin@123', 10),
        firstName: 'Admin',
        lastName: 'Habeshan',
        phone: '+4930123456',
        role: UserRole.ADMIN,
      },
    });
    console.log('✅ Created admin user');
  } else {
    console.log('⏭️  Admin user already exists');
  }

  let vendor = await prisma.user.findUnique({ where: { email: vendorEmail } });
  if (!vendor) {
    vendor = await prisma.user.create({
      data: {
        email: vendorEmail,
        password: await bcrypt.hash('Vendor@123', 10),
        firstName: 'Habeshan',
        lastName: 'Vendor',
        phone: '+4930654321',
        role: UserRole.VENDOR,
      },
    });
    console.log('✅ Created vendor user');
  } else {
    console.log('⏭️  Vendor user already exists');
  }

  let customer = await prisma.user.findUnique({ where: { email: customerEmail } });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        email: customerEmail,
        password: await bcrypt.hash('Customer@123', 10),
        firstName: 'John',
        lastName: 'Müller',
        phone: '+4917012345678',
        role: UserRole.CUSTOMER,
      },
    });
    console.log('✅ Created customer user');
  } else {
    console.log('⏭️  Customer user already exists');
  }

  // ============ VENDOR PROFILE ============
  let vendorProfile = await prisma.vendor.findUnique({ where: { userId: vendor.id } });
  if (!vendorProfile) {
    vendorProfile = await prisma.vendor.create({
      data: {
        userId: vendor.id,
        businessName: 'Habeshan Mini Market',
        description: 'Authentische äthiopische und eritreische Lebensmittel in Deutschland',
        isApproved: true,
        approvedAt: new Date(),
      },
    });
    console.log('✅ Created vendor profile');
  } else {
    console.log('⏭️  Vendor profile already exists');
  }
  // ============ CATEGORIES ============
  const categoryData = [
    {
      name: 'Food & Spices',
      nameEn: 'Food & Spices',
      nameDe: 'Lebensmittel & Gewürze',
      nameAm: 'ምግብ እና ቅመሞች',
      slug: 'food-spices',
      description: 'Traditionelle äthiopische Lebensmittel und Gewürze',
    },
    {
      name: 'Beverages & Drinks',
      nameEn: 'Beverages & Drinks',
      nameDe: 'Getränke',
      nameAm: 'መጠጦች',
      slug: 'beverages-drinks',
      description: 'Äthiopische Getränke und Tees',
    },
    {
      name: 'Grains & Flour',
      nameEn: 'Grains & Flour',
      nameDe: 'Getreide & Mehl',
      nameAm: 'እህሎች',
      slug: 'grains-flour',
      description: 'Teff, Linsen und andere Getreide',
    },
    {
      name: 'Vegetables & Roots',
      nameEn: 'Vegetables & Roots',
      nameDe: 'Gemüse',
      nameAm: 'አትክልቶች',
      slug: 'vegetables-roots',
      description: 'Frisches und getrocknetes Gemüse',
    },
    {
      name: 'Coffee & Tea',
      nameEn: 'Coffee & Tea',
      nameDe: 'Kaffee & Tee',
      nameAm: 'ቡና',
      slug: 'coffee-tea',
      description: 'Äthiopischer Kaffee und Tee',
    },
  ];

  const categories: any = {};
  for (const cat of categoryData) {
    let category = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!category) {
      category = await prisma.category.create({ data: cat });
    }
    categories[cat.slug] = category;
    console.log(`✅ Created/verified ${categoryData.length} categories`);
  }

  // ============ PRODUCTS ============
  const productData = [
    {
      name: 'Ethiopian Coffee Beans (Yirgacheffe)',
      nameEn: 'Ethiopian Coffee Beans (Yirgacheffe)',
      nameDe: 'Äthiopische Kaffeebohnen (Yirgacheffe)',
      nameAm: 'የኢትዮጵያ ቡና',
      description:
        'Premium Yirgacheffe Kaffeebohnen aus Äthiopien. Fruchtig-blumiges Aroma mit Zitrusnoten.',
      descriptionEn:
        'Premium Yirgacheffe coffee beans from Ethiopia. Fruity-floral aroma with citrus notes.',
      descriptionDe:
        'Premium Yirgacheffe Kaffeebohnen aus Äthiopien. Fruchtig-blumiges Aroma mit Zitrusnoten.',
      categorySlug: 'coffee-tea',
      price: 12.99,
      weight: 250,
      sku: 'COFFEE-YIRG-250G',
      slug: 'ethiopian-coffee-yirgacheffe-250g',
      vatRate: 7.0,
      stockQuantity: 50,
      tags: ['coffee', 'yirgacheffe', 'premium'],
    },
    {
      name: 'Teff Flour (Injera Flour)',
      nameEn: 'Teff Flour (Injera Flour)',
      nameDe: 'Teffmehl (Injera Mehl)',
      nameAm: 'ጤፍ',
      description:
        'Traditionelles äthiopisches Teffmehl für Injera. Glutenfrei und reich an Eisen.',
      descriptionEn: 'Traditional Ethiopian teff flour for injera. Gluten-free and rich in iron.',
      descriptionDe:
        'Traditionelles äthiopisches Teffmehl für Injera. Glutenfrei und reich an Eisen.',
      categorySlug: 'grains-flour',
      price: 5.49,
      weight: 1000,
      sku: 'TEFF-FLOUR-1KG',
      slug: 'teff-flour-injera-1kg',
      vatRate: 7.0,
      stockQuantity: 80,
      tags: ['teff', 'flour', 'gluten-free', 'injera'],
    },
    {
      name: 'Berbere Spice Mix',
      nameEn: 'Berbere Spice Mix',
      nameDe: 'Berbere Gewürzmischung',
      nameAm: 'በርበሬ',
      description:
        'Authentische äthiopische Berbere Gewürzmischung. Perfekt für Doro Wat und andere Gerichte.',
      descriptionEn:
        'Authentic Ethiopian berbere spice mix. Perfect for Doro Wat and other dishes.',
      descriptionDe:
        'Authentische äthiopische Berbere Gewürzmischung. Perfekt für Doro Wat und andere Gerichte.',
      categorySlug: 'food-spices',
      price: 6.99,
      weight: 200,
      sku: 'BERBERE-200G',
      slug: 'berbere-spice-mix-200g',
      vatRate: 7.0,
      stockQuantity: 100,
      tags: ['spice', 'berbere', 'hot'],
    },
    {
      name: 'Mitmita Spice',
      nameEn: 'Mitmita Spice',
      nameDe: 'Mitmita Gewürz',
      nameAm: 'ሚጥሚጣ',
      description: 'Scharfe äthiopische Gewürzmischung mit Chili und Kardamom. Ideal für Kitfo.',
      descriptionEn: 'Hot Ethiopian spice mix with chili and cardamom. Ideal for Kitfo.',
      descriptionDe: 'Scharfe äthiopische Gewürzmischung mit Chili und Kardamom. Ideal für Kitfo.',
      categorySlug: 'food-spices',
      price: 5.99,
      weight: 100,
      sku: 'MITMITA-100G',
      slug: 'mitmita-spice-100g',
      vatRate: 7.0,
      stockQuantity: 75,
      tags: ['spice', 'mitmita', 'hot', 'chili'],
    },
    {
      name: 'Niter Kibbeh (Ethiopian Spiced Butter)',
      nameEn: 'Niter Kibbeh (Ethiopian Spiced Butter)',
      nameDe: 'Niter Kibbeh (Äthiopische Gewürzbutter)',
      nameAm: 'ንጥር ቅቤ',
      description:
        'Traditionelle äthiopische geklärte Butter mit Gewürzen. Basis für viele Gerichte.',
      descriptionEn: 'Traditional Ethiopian clarified butter with spices. Base for many dishes.',
      descriptionDe:
        'Traditionelle äthiopische geklärte Butter mit Gewürzen. Basis für viele Gerichte.',
      categorySlug: 'food-spices',
      price: 8.99,
      weight: 250,
      sku: 'NITER-250ML',
      slug: 'niter-kibbeh-250ml',
      vatRate: 7.0,
      stockQuantity: 40,
      tags: ['butter', 'niter-kibbeh', 'spiced'],
    },
    {
      name: 'Injera (Ready-made, Frozen)',
      nameEn: 'Injera (Ready-made, Frozen)',
      nameDe: 'Injera (Fertig, Tiefgekühlt)',
      nameAm: 'እንጀራ',
      description:
        'Fertige Injera-Fladen, tiefgefroren. 5 Stück pro Packung. Einfach auftauen und servieren.',
      descriptionEn:
        'Ready-made injera flatbreads, frozen. 5 pieces per pack. Simply thaw and serve.',
      descriptionDe:
        'Fertige Injera-Fladen, tiefgefroren. 5 Stück pro Packung. Einfach auftauen und servieren.',
      categorySlug: 'food-spices',
      price: 7.99,
      weight: 500,
      sku: 'INJERA-5PCS',
      slug: 'injera-ready-frozen-5pcs',
      vatRate: 7.0,
      stockQuantity: 30,
      tags: ['injera', 'frozen', 'ready-made'],
    },
    {
      name: 'Tej Honey (Raw Ethiopian Honey)',
      nameEn: 'Tej Honey (Raw Ethiopian Honey)',
      nameDe: 'Tej Honig (Roher äthiopischer Honig)',
      nameAm: 'ማር',
      description: 'Roher äthiopischer Honig, perfekt für Tej (Honigwein) oder als Süßungsmittel.',
      descriptionEn: 'Raw Ethiopian honey, perfect for Tej (honey wine) or as sweetener.',
      descriptionDe:
        'Roher äthiopischer Honig, perfekt für Tej (Honigwein) oder als Süßungsmittel.',
      categorySlug: 'food-spices',
      price: 14.99,
      weight: 500,
      sku: 'HONEY-500G',
      slug: 'tej-honey-raw-500g',
      vatRate: 7.0,
      stockQuantity: 25,
      tags: ['honey', 'tej', 'raw', 'natural'],
    },
    {
      name: 'Habeshan Lentils (Messer)',
      nameEn: 'Habeshan Lentils (Messer)',
      nameDe: 'Habeshan Linsen (Messer)',
      nameAm: 'ምስር',
      description: 'Rote Linsen für traditionelles Messer Wat. Schnell kochend und proteinreich.',
      descriptionEn: 'Red lentils for traditional Messer Wat. Quick-cooking and protein-rich.',
      descriptionDe: 'Rote Linsen für traditionelles Messer Wat. Schnell kochend und proteinreich.',
      categorySlug: 'grains-flour',
      price: 3.99,
      weight: 1000,
      sku: 'LENTILS-1KG',
      slug: 'habeshan-lentils-messer-1kg',
      vatRate: 7.0,
      stockQuantity: 90,
      tags: ['lentils', 'messer', 'protein'],
    },
    {
      name: 'Fenugreek Seeds (Abish)',
      nameEn: 'Fenugreek Seeds (Abish)',
      nameDe: 'Bockshornklee Samen (Abish)',
      nameAm: 'አብሽ',
      description:
        'Bockshornklee Samen für äthiopische Gerichte. Wichtige Zutat in vielen Gewürzmischungen.',
      descriptionEn:
        'Fenugreek seeds for Ethiopian dishes. Important ingredient in many spice mixes.',
      descriptionDe:
        'Bockshornklee Samen für äthiopische Gerichte. Wichtige Zutat in vielen Gewürzmischungen.',
      categorySlug: 'food-spices',
      price: 3.49,
      weight: 250,
      sku: 'FENUGREEK-250G',
      slug: 'fenugreek-seeds-abish-250g',
      vatRate: 7.0,
      stockQuantity: 60,
      tags: ['fenugreek', 'abish', 'seeds', 'spice'],
    },
    {
      name: 'Black Cumin (Tikur Azmud)',
      nameEn: 'Black Cumin (Tikur Azmud)',
      nameDe: 'Schwarzkümmel (Tikur Azmud)',
      nameAm: 'ጥቁር አዝሙድ',
      description: 'Äthiopischer Schwarzkümmel. Aromatisch und gesund, für Brot und Gerichte.',
      descriptionEn: 'Ethiopian black cumin. Aromatic and healthy, for bread and dishes.',
      descriptionDe: 'Äthiopischer Schwarzkümmel. Aromatisch und gesund, für Brot und Gerichte.',
      categorySlug: 'food-spices',
      price: 4.29,
      weight: 200,
      sku: 'BLACKCUMIN-200G',
      slug: 'black-cumin-tikur-azmud-200g',
      vatRate: 7.0,
      stockQuantity: 55,
      tags: ['black-cumin', 'tikur-azmud', 'seeds'],
    },
    {
      name: 'Ethiopian Tej Wine',
      nameEn: 'Ethiopian Tej Wine',
      nameDe: 'Äthiopischer Tej Wein',
      nameAm: 'ጠጅ',
      description: 'Traditioneller äthiopischer Honigwein. Süß und aromatisch. Alkoholgehalt 11%.',
      descriptionEn: 'Traditional Ethiopian honey wine. Sweet and aromatic. 11% alcohol.',
      descriptionDe:
        'Traditioneller äthiopischer Honigwein. Süß und aromatisch. Alkoholgehalt 11%.',
      categorySlug: 'beverages-drinks',
      price: 9.99,
      weight: 500,
      sku: 'TEJ-WINE-500ML',
      slug: 'ethiopian-tej-wine-500ml',
      vatRate: 19.0,
      stockQuantity: 20,
      tags: ['tej', 'wine', 'honey-wine', 'alcohol'],
    },
    {
      name: 'Habeshan Tej Starter Kit',
      nameEn: 'Habeshan Tej Starter Kit',
      nameDe: 'Habeshan Tej Starter Set',
      nameAm: 'ጠጅ ስብስብ',
      description: 'Komplettes Set zum Selbermachen von Tej. Enthält Honig, Gesho und Anleitung.',
      descriptionEn: 'Complete kit for making Tej at home. Includes honey, Gesho and instructions.',
      descriptionDe: 'Komplettes Set zum Selbermachen von Tej. Enthält Honig, Gesho und Anleitung.',
      categorySlug: 'food-spices',
      price: 19.99,
      weight: 1000,
      sku: 'TEJ-KIT',
      slug: 'habeshan-tej-starter-kit',
      vatRate: 7.0,
      stockQuantity: 15,
      tags: ['tej', 'kit', 'diy', 'gesho'],
    },
    {
      name: 'Teff Grain (Whole)',
      nameEn: 'Teff Grain (Whole)',
      nameDe: 'Teff Körner (Ganz)',
      nameAm: 'ጤፍ ጥራጥሬ',
      description: 'Ganze Teff Körner. Kann als Beilage gekocht oder zu Mehl gemahlen werden.',
      descriptionEn: 'Whole teff grains. Can be cooked as side dish or ground into flour.',
      descriptionDe: 'Ganze Teff Körner. Kann als Beilage gekocht oder zu Mehl gemahlen werden.',
      categorySlug: 'grains-flour',
      price: 4.99,
      weight: 1000,
      sku: 'TEFF-GRAIN-1KG',
      slug: 'teff-grain-whole-1kg',
      vatRate: 7.0,
      stockQuantity: 70,
      tags: ['teff', 'grain', 'whole', 'gluten-free'],
    },
    {
      name: 'Cardamom (Korerima)',
      nameEn: 'Cardamom (Korerima)',
      nameDe: 'Kardamom (Korerima)',
      nameAm: 'ቆረሪማ',
      description: 'Äthiopischer Kardamom. Intensives Aroma für Kaffee und Gewürzmischungen.',
      descriptionEn: 'Ethiopian cardamom. Intense aroma for coffee and spice mixes.',
      descriptionDe: 'Äthiopischer Kardamom. Intensives Aroma für Kaffee und Gewürzmischungen.',
      categorySlug: 'food-spices',
      price: 7.49,
      weight: 100,
      sku: 'CARDAMOM-100G',
      slug: 'cardamom-korerima-100g',
      vatRate: 7.0,
      stockQuantity: 45,
      tags: ['cardamom', 'korerima', 'spice'],
    },
    {
      name: 'Ethiopian Green Coffee (Raw)',
      nameEn: 'Ethiopian Green Coffee (Raw)',
      nameDe: 'Äthiopischer Grüner Kaffee (Roh)',
      nameAm: 'ጥሬ ቡና',
      description:
        'Rohe grüne Kaffeebohnen zum Selbströsten. Traditionell für die Kaffeezeremonie.',
      descriptionEn: 'Raw green coffee beans for home roasting. Traditional for coffee ceremony.',
      descriptionDe:
        'Rohe grüne Kaffeebohnen zum Selbströsten. Traditionell für die Kaffeezeremonie.',
      categorySlug: 'coffee-tea',
      price: 10.99,
      weight: 500,
      sku: 'GREEN-COFFEE-500G',
      slug: 'ethiopian-green-coffee-raw-500g',
      vatRate: 7.0,
      stockQuantity: 35,
      tags: ['coffee', 'green', 'raw', 'ceremony'],
    },
  ];

  const products: any[] = [];
  for (const prod of productData) {
    let product = await prisma.product.findUnique({ where: { sku: prod.sku } });
    if (!product) {
      const { categorySlug, ...productFields } = prod;
      product = await prisma.product.create({
        data: {
          ...productFields,
          categoryId: categories[categorySlug].id,
          costPrice: Math.round(prod.price * 0.6 * 100) / 100,
          images: [`https://placeholder.com/400x400?text=${encodeURIComponent(prod.name)}`],
          thumbnailUrl: `https://placeholder.com/200x200?text=${encodeURIComponent(prod.name)}`,
          createdBy: admin.id,
          status: 'ACTIVE',
        },
      });
    }
    products.push(product);
    console.log(`✅ Created/verified ${productData.length} products`);
    console.log(`✅ Created/verified ${productData.length} products`);
  }
  // ============ INVENTORY ============
  let inventoryCount = 0;
  for (const product of products) {
    const existing = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if (!existing) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          quantity: product.stockQuantity,
          reservedQuantity: 0,
          reorderLevel: 5,
        },
      });
      inventoryCount++;
    }
  }
  console.log(`✅ Created/verified ${products.length} inventory records`);

  // ============ ADDRESSES ============
  const existingAddress = await prisma.address.findFirst({
    where: { userId: customer.id, city: 'Berlin' },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        street: 'Friedrichstraße 123',
        city: 'Berlin',
        postalCode: '10117',
        country: 'Germany',
        isDefault: true,
        label: 'Home',
      },
    });
    console.log('✅ Created customer address');
  } else {
    console.log('⏭️  Customer address already exists');
  }

  // ============ COUPONS ============
  const couponData = [
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE' as const,
      value: 10,
      minOrderValue: 20,
      maxUses: 100,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    },
    {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING' as const,
      value: 0,
      minOrderValue: 30,
      maxUses: 50,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    },
    {
      code: 'HABESHAN5',
      type: 'FIXED_AMOUNT' as const,
      value: 5,
      minOrderValue: 25,
      maxUses: null,
      expiresAt: null,
    },
  ];

  let couponCount = 0;
  for (const coup of couponData) {
    const existing = await prisma.coupon.findUnique({ where: { code: coup.code } });
    if (!existing) {
      await prisma.coupon.create({ data: coup });
      couponCount++;
    }
  }
  console.log(`✅ Created/verified ${couponData.length} coupons`);

  // ============ REVIEWS ============
  // Note: Reviews require orderId, so we'll create placeholder reviews without orders for demo
  // In production, reviews should only be created after actual purchases
  const reviewData = [
    {
      productSku: 'COFFEE-YIRG-250G',
      rating: 5,
      title: 'Hervorragender Kaffee!',
      content:
        'Der beste äthiopische Kaffee, den ich je probiert habe. Sehr aromatisch und frisch.',
    },
    {
      productSku: 'COFFEE-YIRG-250G',
      rating: 5,
      title: 'Excellent quality',
      content: 'Amazing coffee with fruity notes. Will definitely order again!',
    },
    {
      productSku: 'COFFEE-YIRG-250G',
      rating: 4,
      title: 'Sehr gut',
      content: 'Toller Kaffee, etwas teuer aber die Qualität stimmt.',
    },
    {
      productSku: 'TEFF-FLOUR-1KG',
      rating: 5,
      title: 'Perfekt für Injera',
      content: 'Authentisches Teffmehl, genau wie in Äthiopien. Injera gelingt perfekt!',
    },
    {
      productSku: 'TEFF-FLOUR-1KG',
      rating: 4,
      title: 'Gute Qualität',
      content: 'Sehr feines Mehl, Injera wird schön weich.',
    },
    {
      productSku: 'BERBERE-200G',
      rating: 5,
      title: 'Authentisch scharf!',
      content: 'Genau die richtige Schärfe für Doro Wat. Sehr authentisch!',
    },
    {
      productSku: 'BERBERE-200G',
      rating: 5,
      title: 'Best Berbere',
      content: 'This is the real deal. Perfect spice blend for Ethiopian cooking.',
    },
  ];

  let reviewCount = 0;
  for (const rev of reviewData) {
    const product = products.find((p) => p.sku === rev.productSku);
    if (product) {
      const existing = await prisma.review.findFirst({
        where: {
          productId: product.id,
          customerId: customer.id,
          title: rev.title,
        },
      });
      if (!existing) {
        await prisma.review.create({
          data: {
            productId: product.id,
            customerId: customer.id,
            orderId: 'demo-order-' + Math.random().toString(36).substr(2, 9),
            rating: rev.rating,
            title: rev.title,
            content: rev.content,
            isVerifiedPurchase: true,
            status: 'APPROVED',
          },
        });
        reviewCount++;
      }
    }
  }
  console.log(`✅ Created/verified ${reviewData.length} reviews`);

  // ============ SUMMARY ============
  console.log('\n📊 Seed Summary:');
  const counts = {
    users: await prisma.user.count(),
    vendors: await prisma.vendor.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    inventory: await prisma.inventory.count(),
    addresses: await prisma.address.count(),
    coupons: await prisma.coupon.count(),
    reviews: await prisma.review.count(),
  };

  console.log(`   Users: ${counts.users}`);
  console.log(`   Vendors: ${counts.vendors}`);
  console.log(`   Categories: ${counts.categories}`);
  console.log(`   Products: ${counts.products}`);
  console.log(`   Inventory: ${counts.inventory}`);
  console.log(`   Addresses: ${counts.addresses}`);
  console.log(`   Coupons: ${counts.coupons}`);
  console.log(`   Reviews: ${counts.reviews}`);
  console.log(`   Total: ${Object.values(counts).reduce((a, b) => a + b, 0)} records`);

  console.log('\n🎉 Database seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
