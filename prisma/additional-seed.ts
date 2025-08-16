import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create blouse design categories
  const categories = await Promise.all([
    prisma.blouseDesignCategory.create({
      data: {
        name: 'Traditional',
        description: 'Classic and traditional blouse designs',
        image: '/api/placeholder/200/200'
      }
    }),
    prisma.blouseDesignCategory.create({
      data: {
        name: 'Modern',
        description: 'Contemporary and fashionable blouse designs',
        image: '/api/placeholder/200/200'
      }
    }),
    prisma.blouseDesignCategory.create({
      data: {
        name: 'Bridal',
        description: 'Elegant bridal blouse designs for special occasions',
        image: '/api/placeholder/200/200'
      }
    }),
    prisma.blouseDesignCategory.create({
      data: {
        name: 'Casual',
        description: 'Comfortable casual blouse designs for daily wear',
        image: '/api/placeholder/200/200'
      }
    })
  ])

  // Get existing designs to add variants
  const designs = await prisma.blouseDesign.findMany()

  // Create design variants for each design
  for (const design of designs) {
    const variants = [
      {
        name: 'Simple',
        description: 'Basic version with minimal embellishments',
        image: '/api/placeholder/200/200',
        designId: design.id
      },
      {
        name: 'Embroidered',
        description: 'Version with intricate embroidery work',
        image: '/api/placeholder/200/200',
        designId: design.id
      },
      {
        name: 'Stone Work',
        description: 'Elegant version with stone embellishments',
        image: '/api/placeholder/200/200',
        designId: design.id
      },
      {
        name: 'Mirror Work',
        description: 'Traditional version with mirror work',
        image: '/api/placeholder/200/200',
        designId: design.id
      }
    ]

    await prisma.blouseDesignVariant.createMany({
      data: variants
    })
  }

  // Create blouse models with front and back designs
  const frontDesigns = await prisma.blouseDesign.findMany({
    where: { type: 'FRONT' }
  })

  const backDesigns = await prisma.blouseDesign.findMany({
    where: { type: 'BACK' }
  })

  const models = [
    {
      name: 'Classic Model',
      description: 'Timeless classic model suitable for all occasions',
      price: 1500,
      finalPrice: 1500,
      image: '/api/placeholder/300/400'
    },
    {
      name: 'Designer Model',
      description: 'Premium designer model with intricate details',
      price: 2500,
      finalPrice: 2500,
      image: '/api/placeholder/300/400'
    },
    {
      name: 'Bridal Model',
      description: 'Luxurious bridal model for special occasions',
      price: 3500,
      finalPrice: 3500,
      image: '/api/placeholder/300/400'
    },
    {
      name: 'Casual Model',
      description: 'Comfortable casual model for daily wear',
      price: 1000,
      finalPrice: 1000,
      image: '/api/placeholder/300/400'
    },
    {
      name: 'Party Wear Model',
      description: 'Stylish model perfect for parties and events',
      price: 2000,
      finalPrice: 2000,
      image: '/api/placeholder/300/400'
    },
    {
      name: 'Traditional Model',
      description: 'Authentic traditional model with cultural elements',
      price: 1800,
      finalPrice: 1800,
      image: '/api/placeholder/300/400'
    }
  ]

  // Create models with front and back design combinations
  for (let i = 0; i < models.length; i++) {
    const model = models[i]
    const frontDesign = frontDesigns[i % frontDesigns.length]
    const backDesign = backDesigns[i % backDesigns.length]

    await prisma.blouseModel.create({
      data: {
        name: model.name,
        description: model.description,
        price: model.price,
        finalPrice: model.finalPrice,
        image: model.image,
        frontDesignId: frontDesign.id,
        backDesignId: backDesign.id
      }
    })
  }

  // Update some designs with categories
  const traditionalDesigns = designs.slice(0, 3)
  const modernDesigns = designs.slice(3, 6)
  const bridalDesigns = designs.slice(6, 9)
  const casualDesigns = designs.slice(9, 12)

  for (const design of traditionalDesigns) {
    await prisma.blouseDesign.update({
      where: { id: design.id },
      data: { categoryId: categories[0].id }
    })
  }

  for (const design of modernDesigns) {
    await prisma.blouseDesign.update({
      where: { id: design.id },
      data: { categoryId: categories[1].id }
    })
  }

  for (const design of bridalDesigns) {
    await prisma.blouseDesign.update({
      where: { id: design.id },
      data: { categoryId: categories[2].id }
    })
  }

  for (const design of casualDesigns) {
    await prisma.blouseDesign.update({
      where: { id: design.id },
      data: { categoryId: categories[3].id }
    })
  }

  console.log('Additional design data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })