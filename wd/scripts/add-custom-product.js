const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Creating custom product category...')
    
    // Create custom category if it doesn't exist
    const customCategory = await prisma.category.upsert({
      where: { name: 'custom-designs' },
      update: {},
      create: {
        name: 'custom-designs',
        description: 'Custom design products'
      }
    })

    console.log('Category created/updated:', customCategory.name)

    // Create virtual custom blouse product
    console.log('Creating virtual custom blouse product...')
    
    const customProduct = await prisma.product.upsert({
      where: { id: 'custom-blouse' },
      update: {},
      create: {
        id: 'custom-blouse',
        name: 'Custom Blouse Design',
        description: 'Virtual product for custom blouse designs',
        price: 0,
        finalPrice: 0,
        stock: 999999,
        sku: 'CUSTOM-BLOUSE',
        categoryId: customCategory.id,
        isActive: true,
        isFeatured: false
      }
    })

    console.log('Virtual product created:', customProduct.name, 'with ID:', customProduct.id)
    console.log('Custom design order functionality should now work correctly!')
    
  } catch (error) {
    console.error('Error creating custom product:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })