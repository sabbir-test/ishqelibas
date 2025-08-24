const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./db/custom.db'
    }
  }
})

async function main() {
  try {
    console.log('Checking if custom-blouse product exists...')
    
    const customProduct = await prisma.product.findUnique({
      where: { id: 'custom-blouse' },
      include: {
        category: true
      }
    })

    if (customProduct) {
      console.log('✅ Custom product found:')
      console.log('ID:', customProduct.id)
      console.log('Name:', customProduct.name)
      console.log('Price:', customProduct.price)
      console.log('Stock:', customProduct.stock)
      console.log('SKU:', customProduct.sku)
      console.log('Category:', customProduct.category?.name)
      console.log('Active:', customProduct.isActive)
    } else {
      console.log('❌ Custom product NOT found!')
      
      // Check if any products exist
      const allProducts = await prisma.product.findMany()
      console.log('Total products in database:', allProducts.length)
      
      if (allProducts.length > 0) {
        console.log('First few products:')
        allProducts.slice(0, 3).forEach(p => {
          console.log(`- ${p.id}: ${p.name}`)
        })
      }
    }
    
  } catch (error) {
    console.error('Error checking custom product:', error)
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