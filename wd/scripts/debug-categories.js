const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCategories() {
  try {
    console.log('🔍 Debugging Categories and Products...\n');

    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        products: {
          take: 3,
          select: {
            id: true,
            name: true,
            price: true,
            finalPrice: true,
            stock: true
          }
        }
      }
    });

    console.log('📂 Categories in Database:');
    categories.forEach(category => {
      console.log(`\n- Category: "${category.name}" (ID: ${category.id})`);
      console.log(`  Description: ${category.description}`);
      console.log(`  Products count: ${category.products.length}`);
      category.products.forEach(product => {
        console.log(`    • Product: ${product.name} - ₹${product.price}`);
      });
    });

    // Get all products with their categories
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      take: 10
    });

    console.log('\n🛍️  Sample Products with Categories:');
    products.forEach(product => {
      console.log(`- ${product.name} (Category: "${product.category?.name || 'No Category'}") - ₹${product.price}`);
    });

    // Test category filtering
    console.log('\n🧪 Testing Category Filter:');
    const sareeProducts = await prisma.product.findMany({
      where: {
        category: {
          name: 'sarees'
        },
        isActive: true
      },
      include: {
        category: true
      }
    });

    console.log(`\nFound ${sareeProducts.length} saree products:`);
    sareeProducts.forEach(product => {
      console.log(`- ${product.name} (Category: ${product.category.name})`);
    });

    const kurtisProducts = await prisma.product.findMany({
      where: {
        category: {
          name: 'kurtis'
        },
        isActive: true
      },
      include: {
        category: true
      }
    });

    console.log(`\nFound ${kurtisProducts.length} kurtis products:`);
    kurtisProducts.forEach(product => {
      console.log(`- ${product.name} (Category: ${product.category.name})`);
    });

  } catch (error) {
    console.error('❌ Error debugging categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCategories();