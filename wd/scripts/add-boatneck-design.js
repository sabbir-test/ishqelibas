const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Adding Boatneck design and variants...')
    
    // Check if Boatneck design already exists
    const existingBoatneck = await prisma.blouseDesign.findFirst({
      where: {
        name: { contains: 'boatneck' }
      }
    })
    
    if (existingBoatneck) {
      console.log(`Boatneck design already exists: ${existingBoatneck.name}`)
      return
    }
    
    // Create Boatneck design
    const boatneckDesign = await prisma.blouseDesign.create({
      data: {
        name: 'Boatneck',
        type: 'FRONT',
        description: 'Classic wide neckline that sits across the collarbone',
        isActive: true
      }
    })
    
    console.log(`Created Boatneck design: ${boatneckDesign.name}`)
    
    // Add variants for Boatneck
    const boatneckVariants = [
      { name: 'Classic Boatneck', description: 'Traditional wide boatneck style' },
      { name: 'Deep Boatneck', description: 'Deeper cut for more elegant look' },
      { name: 'Boatneck with Pleats', description: 'Boatneck with decorative pleats' },
      { name: 'Asymmetrical Boatneck', description: 'Modern asymmetrical boatneck design' }
    ]
    
    for (const variantData of boatneckVariants) {
      await prisma.blouseDesignVariant.create({
        data: {
          name: variantData.name,
          description: variantData.description,
          designId: boatneckDesign.id,
          isActive: true
        }
      })
      console.log(`  - Added variant: ${variantData.name}`)
    }
    
    console.log(`\nSuccessfully added Boatneck design with 4 variants!`)
    
    // Show final count
    const finalDesigns = await prisma.blouseDesign.count({
      where: { isActive: true }
    })
    const finalVariants = await prisma.blouseDesignVariant.count({
      where: { isActive: true }
    })
    console.log(`Total active designs: ${finalDesigns}`)
    console.log(`Total active variants: ${finalVariants}`)
    
  } catch (error) {
    console.error('Error adding Boatneck design:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()