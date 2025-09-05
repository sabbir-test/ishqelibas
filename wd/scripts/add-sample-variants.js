const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Adding sample blouse design variants...')
    
    // Get all existing designs
    const designs = await prisma.blouseDesign.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    
    console.log(`Found ${designs.length} existing designs`)
    
    // Sample variants for different design types
    const sampleVariants = [
      // Boatneck variants
      {
        designName: 'Boatneck',
        variants: [
          { name: 'Classic Boatneck', description: 'Traditional wide boatneck style' },
          { name: 'Deep Boatneck', description: 'Deeper cut for more elegant look' },
          { name: 'Boatneck with Pleats', description: 'Boatneck with decorative pleats' },
          { name: 'Asymmetrical Boatneck', description: 'Modern asymmetrical boatneck design' }
        ]
      },
      // V-Neck variants
      {
        designName: 'V-Neck',
        variants: [
          { name: 'Deep V-Neck', description: 'Elegant deep V-neck style' },
          { name: 'Modest V-Neck', description: 'Subtle V-neck for conservative look' },
          { name: 'V-Neck with Lace', description: 'V-neck with delicate lace trim' },
          { name: 'Double V-Neck', description: 'Layered double V-neck design' }
        ]
      },
      // Round Neck variants
      {
        designName: 'Round Neck',
        variants: [
          { name: 'Classic Round Neck', description: 'Traditional round neckline' },
          { name: 'High Round Neck', description: 'Higher neckline for modest look' },
          { name: 'Round Neck with Piping', description: 'Round neck with contrast piping' },
          { name: 'Sweetheart Round Neck', description: 'Romantic sweetheart variation' }
        ]
      },
      // Square Neck variants
      {
        designName: 'Square Neck',
        variants: [
          { name: 'Classic Square Neck', description: 'Traditional square neckline' },
          { name: 'Wide Square Neck', description: 'Broader square opening' },
          { name: 'Square Neck with Frills', description: 'Square neck with decorative frills' },
          { name: 'Offset Square Neck', description: 'Modern asymmetric square design' }
        ]
      },
      // Back designs
      {
        designName: 'Deep Back',
        variants: [
          { name: 'Deep U-Back', description: 'Elegant deep U-shaped back' },
          { name: 'Deep V-Back', description: 'Sensual deep V-shaped back' },
          { name: 'Deep Round Back', description: 'Classic deep round back design' },
          { name: 'Deep Back with Tie', description: 'Deep back with decorative tie closure' }
        ]
      },
      {
        designName: 'Keyhole Back',
        variants: [
          { name: 'Round Keyhole', description: 'Classic round keyhole opening' },
          { name: 'Teardrop Keyhole', description: 'Elegant teardrop shaped keyhole' },
          { name: 'Heart Keyhole', description: 'Romantic heart-shaped keyhole' },
          { name: 'Double Keyhole', description: 'Modern double keyhole design' }
        ]
      }
    ]
    
    let totalVariantsAdded = 0
    
    for (const designGroup of sampleVariants) {
      const design = designs.find(d => d.name.toLowerCase().includes(designGroup.designName.toLowerCase()))
      
      if (design) {
        console.log(`Adding variants for ${design.name} (${design.type})...`)
        
        for (const variantData of designGroup.variants) {
          // Check if variant already exists
          const existingVariant = await prisma.blouseDesignVariant.findFirst({
            where: {
              designId: design.id,
              name: variantData.name
            }
          })
          
          if (!existingVariant) {
            await prisma.blouseDesignVariant.create({
              data: {
                name: variantData.name,
                description: variantData.description,
                designId: design.id,
                isActive: true
              }
            })
            console.log(`  - Added variant: ${variantData.name}`)
            totalVariantsAdded++
          } else {
            console.log(`  - Variant already exists: ${variantData.name}`)
          }
        }
      } else {
        console.log(`Design not found: ${designGroup.designName}`)
      }
    }
    
    console.log(`\nSuccessfully added ${totalVariantsAdded} new variants!`)
    
    // Show final count
    const finalVariants = await prisma.blouseDesignVariant.count({
      where: { isActive: true }
    })
    console.log(`Total active variants in database: ${finalVariants}`)
    
  } catch (error) {
    console.error('Error adding sample variants:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()