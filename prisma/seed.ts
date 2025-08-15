import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const sareesCategory = await prisma.category.create({
    data: {
      name: 'sarees',
      description: 'Traditional Indian sarees'
    }
  })

  const salwarCategory = await prisma.category.create({
    data: {
      name: 'salwar-kameez',
      description: 'Traditional salwar kameez sets'
    }
  })

  const lehengaCategory = await prisma.category.create({
    data: {
      name: 'lehenga-choli',
      description: 'Bridal and festive lehenga choli'
    }
  })

  const kurtisCategory = await prisma.category.create({
    data: {
      name: 'kurtis',
      description: 'Casual and formal kurtis'
    }
  })

  // Create products
  await prisma.product.create({
    data: {
      name: 'Elegant Silk Saree',
      description: 'Pure silk saree with intricate zari work',
      price: 4999,
      finalPrice: 4999,
      stock: 10,
      sku: 'SAREE-001',
      images: JSON.stringify(['/api/placeholder/300/400']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['red', 'blue', 'green']),
      categoryId: sareesCategory.id,
      isFeatured: true
    }
  })

  await prisma.product.create({
    data: {
      name: 'Designer Salwar Kameez',
      description: 'Cotton salwar kameez with embroidery',
      price: 2999,
      finalPrice: 2999,
      stock: 15,
      sku: 'SALWAR-001',
      images: JSON.stringify(['/api/placeholder/300/400']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['pink', 'yellow', 'orange', 'purple']),
      categoryId: salwarCategory.id,
      isFeatured: true
    }
  })

  await prisma.product.create({
    data: {
      name: 'Bridal Lehenga Choli',
      description: 'Heavy embroidery lehenga for special occasions',
      price: 12999,
      finalPrice: 12999,
      stock: 5,
      sku: 'LEHENGA-001',
      images: JSON.stringify(['/api/placeholder/300/400']),
      sizes: JSON.stringify(['S', 'M', 'L']),
      colors: JSON.stringify(['red', 'maroon', 'gold']),
      categoryId: lehengaCategory.id,
      isFeatured: true
    }
  })

  await prisma.product.create({
    data: {
      name: 'Casual Kurti',
      description: 'Comfortable cotton kurti for daily wear',
      price: 999,
      finalPrice: 999,
      stock: 25,
      sku: 'KURTI-001',
      images: JSON.stringify(['/api/placeholder/300/400']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['blue', 'black', 'white', 'gray']),
      categoryId: kurtisCategory.id,
      isFeatured: false
    }
  })

  await prisma.product.create({
    data: {
      name: 'Premium Silk Saree',
      description: 'Premium quality silk saree with designer border',
      price: 7999,
      finalPrice: 7999,
      stock: 8,
      sku: 'SAREE-002',
      images: JSON.stringify(['/api/placeholder/300/400']),
      sizes: JSON.stringify(['M', 'L', 'XL']),
      colors: JSON.stringify(['green', 'teal', 'navy']),
      categoryId: sareesCategory.id,
      isFeatured: true
    }
  })

  await prisma.product.create({
    data: {
      name: 'Cotton Salwar Suit',
      description: 'Comfortable cotton salwar suit for daily wear',
      price: 1999,
      finalPrice: 1999,
      stock: 20,
      sku: 'SALWAR-002',
      images: JSON.stringify(['/api/placeholder/300/400']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['beige', 'cream', 'brown']),
      categoryId: salwarCategory.id,
      isFeatured: false
    }
  })

  // Create fabrics for custom blouse designs
  await prisma.fabric.createMany({
    data: [
      {
        name: 'Pure Silk',
        type: 'Silk',
        color: 'Red',
        pricePerMeter: 1200,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Soft Cotton',
        type: 'Cotton',
        color: 'Blue',
        pricePerMeter: 400,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Georgette',
        type: 'Synthetic',
        color: 'Pink',
        pricePerMeter: 600,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Chiffon',
        type: 'Synthetic',
        color: 'Purple',
        pricePerMeter: 500,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Banarasi Silk',
        type: 'Silk',
        color: 'Gold',
        pricePerMeter: 2500,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Net Fabric',
        type: 'Synthetic',
        color: 'Black',
        pricePerMeter: 800,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Velvet',
        type: 'Velvet',
        color: 'Maroon',
        pricePerMeter: 1800,
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Satin',
        type: 'Synthetic',
        color: 'Silver',
        pricePerMeter: 900,
        image: '/api/placeholder/200/200'
      }
    ]
  })

  // Create blouse designs
  await prisma.blouseDesign.createMany({
    data: [
      // Front designs
      {
        name: 'Classic Round Neck',
        type: 'FRONT',
        description: 'Traditional round neck design with simple elegance',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Elegant V-Neck',
        type: 'FRONT',
        description: 'Sophisticated V-neck design for graceful look',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Sweetheart Neck',
        type: 'FRONT',
        description: 'Romantic sweetheart neckline for special occasions',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Boat Neck',
        type: 'FRONT',
        description: 'Wide boat neck design for modern appeal',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Square Neck',
        type: 'FRONT',
        description: 'Classic square neck with contemporary style',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Halter Neck',
        type: 'FRONT',
        description: 'Trendy halter neck for bold fashion statement',
        image: '/api/placeholder/200/200'
      },
      // Back designs
      {
        name: 'Plain Back',
        type: 'BACK',
        description: 'Simple and elegant plain back design',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Deep Cut Back',
        type: 'BACK',
        description: 'Elegant deep cut back for glamorous look',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Keyhole Back',
        type: 'BACK',
        description: 'Stylish keyhole back design with modern appeal',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Criss Cross Back',
        type: 'BACK',
        description: 'Modern criss-cross back pattern',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Tie-Up Back',
        type: 'BACK',
        description: 'Charming tie-up back with adjustable fit',
        image: '/api/placeholder/200/200'
      },
      {
        name: 'Lace Back',
        type: 'BACK',
        description: 'Delicate lace back for feminine touch',
        image: '/api/placeholder/200/200'
      }
    ]
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })