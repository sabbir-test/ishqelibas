const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupVirtualProducts() {
  console.log('🔧 Setting up virtual products for custom designs...\n')

  try {
    // Get or create a category for virtual products
    let virtualCategory = await prisma.category.findFirst({
      where: { name: 'Virtual Products' }
    })

    if (!virtualCategory) {
      virtualCategory = await prisma.category.create({
        data: {
          name: 'Virtual Products',
          description: 'Virtual products for custom designs and special orders',
          isActive: true
        }
      })
      console.log(`✅ Created virtual category: ${virtualCategory.id}`)
    } else {
      console.log(`✅ Using existing virtual category: ${virtualCategory.id}`)
    }

    // Create custom-blouse virtual product
    const customBlouseExists = await prisma.product.findUnique({
      where: { id: 'custom-blouse' }
    })

    if (!customBlouseExists) {
      const customBlouse = await prisma.product.create({
        data: {
          id: 'custom-blouse',
          name: 'Custom Blouse Design',
          description: 'Virtual product for custom blouse designs with personalized measurements and fabric selection',
          price: 0, // Price is calculated dynamically
          finalPrice: 0,
          stock: 999999, // Unlimited virtual stock
          sku: 'CUSTOM-BLOUSE-001',
          isActive: true,
          isFeatured: false,
          categoryId: virtualCategory.id
        }
      })
      console.log(`✅ Created custom-blouse virtual product: ${customBlouse.id}`)
    } else {
      console.log(`✅ Custom-blouse product already exists`)
    }

    // Create custom-salwar-kameez virtual product
    const customSalwarExists = await prisma.product.findUnique({
      where: { id: 'custom-salwar-kameez' }
    })

    if (!customSalwarExists) {
      const customSalwar = await prisma.product.create({
        data: {
          id: 'custom-salwar-kameez',
          name: 'Custom Salwar Kameez Design',
          description: 'Virtual product for custom salwar kameez designs with personalized measurements and fabric selection',
          price: 0, // Price is calculated dynamically
          finalPrice: 0,
          stock: 999999, // Unlimited virtual stock
          sku: 'CUSTOM-SALWAR-001',
          isActive: true,
          isFeatured: false,
          categoryId: virtualCategory.id
        }
      })
      console.log(`✅ Created custom-salwar-kameez virtual product: ${customSalwar.id}`)
    } else {
      console.log(`✅ Custom-salwar-kameez product already exists`)
    }

    console.log('\n🎉 Virtual products setup completed!')

    // Verify setup
    const virtualProducts = await prisma.product.findMany({
      where: {
        categoryId: virtualCategory.id
      },
      select: {
        id: true,
        name: true,
        sku: true,
        isActive: true
      }
    })

    console.log('\n📋 Virtual products in database:')
    virtualProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.id}) - SKU: ${product.sku} - Active: ${product.isActive}`)
    })

  } catch (error) {
    console.error('❌ Error setting up virtual products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupVirtualProducts()