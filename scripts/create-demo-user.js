const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('Creating demo user...');

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (existingUser) {
      console.log('Demo user already exists:', existingUser);
      return existingUser;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync('demo123', 10);

    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        phone: '+91 98765 43210',
        address: '123 Demo Street, Demo City',
        city: 'Demo City',
        state: 'Demo State',
        country: 'India',
        zipCode: '123456',
        role: 'USER',
        isActive: true
      }
    });

    console.log('Demo user created successfully:', demoUser);
    return demoUser;

  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Create some demo fabrics
async function createDemoFabrics() {
  try {
    console.log('Creating demo fabrics...');

    const fabrics = [
      {
        name: 'Premium Silk',
        type: 'Silk',
        color: '#FF6B6B',
        pricePerMeter: 1200,
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
      },
      {
        name: 'Soft Cotton',
        type: 'Cotton',
        color: '#4ECDC4',
        pricePerMeter: 800,
        image: 'https://images.unsplash.com/photo-1523381210436-8c93b2e8e4e1?w=400&h=400&fit=crop'
      },
      {
        name: 'Elegant Georgette',
        type: 'Georgette',
        color: '#45B7D1',
        pricePerMeter: 600,
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
      },
      {
        name: 'Luxury Chiffon',
        type: 'Chiffon',
        color: '#F7DC6F',
        pricePerMeter: 900,
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop'
      }
    ];

    for (const fabric of fabrics) {
      const existing = await prisma.fabric.findFirst({
        where: { name: fabric.name }
      });

      if (!existing) {
        await prisma.fabric.create({
          data: fabric
        });
        console.log(`Created fabric: ${fabric.name}`);
      }
    }

  } catch (error) {
    console.error('Error creating demo fabrics:', error);
    throw error;
  }
}

// Create demo design categories
async function createDemoCategories() {
  try {
    console.log('Creating demo design categories...');

    const categories = [
      {
        name: 'Classic Necklines',
        description: 'Traditional and timeless neck designs'
      },
      {
        name: 'Modern Styles',
        description: 'Contemporary and fashionable neck patterns'
      },
      {
        name: 'Elegant Back Designs',
        description: 'Sophisticated back patterns for special occasions'
      }
    ];

    for (const category of categories) {
      const existing = await prisma.blouseDesignCategory.findFirst({
        where: { name: category.name }
      });

      if (!existing) {
        await prisma.blouseDesignCategory.create({
          data: category
        });
        console.log(`Created category: ${category.name}`);
      }
    }

  } catch (error) {
    console.error('Error creating demo categories:', error);
    throw error;
  }
}

// Create demo blouse designs with variants
async function createDemoDesigns() {
  try {
    console.log('Creating demo blouse designs...');

    // Get categories
    const classicCategory = await prisma.blouseDesignCategory.findFirst({
      where: { name: 'Classic Necklines' }
    });
    const modernCategory = await prisma.blouseDesignCategory.findFirst({
      where: { name: 'Modern Styles' }
    });
    const backCategory = await prisma.blouseDesignCategory.findFirst({
      where: { name: 'Elegant Back Designs' }
    });

    // Front designs
    const frontDesigns = [
      {
        name: 'Classic Round Neck',
        type: 'FRONT',
        description: 'Traditional round neck design suitable for all occasions',
        categoryId: classicCategory?.id,
        variants: [
          { name: 'Simple Round', description: 'Basic round neck with clean finish' },
          { name: 'Round with Lace', description: 'Round neck enhanced with delicate lace trim' },
          { name: 'Round with Embroidery', description: 'Round neck with beautiful embroidery work' }
        ]
      },
      {
        name: 'Elegant V-Neck',
        type: 'FRONT',
        description: 'Sophisticated V-neck design for a graceful look',
        categoryId: classicCategory?.id,
        variants: [
          { name: 'Deep V-Neck', description: 'Elegant deep V-neck for formal occasions' },
          { name: 'Modest V-Neck', description: 'Subtle V-neck perfect for everyday wear' },
          { name: 'V-Neck with Collar', description: 'V-neck combined with stylish collar' }
        ]
      },
      {
        name: 'Modern Boat Neck',
        type: 'FRONT',
        description: 'Contemporary boat neck for a trendy appearance',
        categoryId: modernCategory?.id,
        variants: [
          { name: 'Wide Boat Neck', description: 'Spacious boat neck for relaxed fit' },
          { name: 'Narrow Boat Neck', description: 'Slim boat neck for sleek look' },
          { name: 'Boat Neck with Frills', description: 'Boat neck decorated with cute frills' }
        ]
      }
    ];

    // Back designs
    const backDesigns = [
      {
        name: 'Elegant Deep Back',
        type: 'BACK',
        description: 'Sophisticated deep back design for special occasions',
        categoryId: backCategory?.id,
        variants: [
          { name: 'Deep U-Back', description: 'Classic U-shaped deep back design' },
          { name: 'Deep V-Back', description: 'Elegant V-shaped deep back pattern' },
          { name: 'Deep Round Back', description: 'Round deep back with graceful curves' }
        ]
      },
      {
        name: 'Classic Regular Back',
        type: 'BACK',
        description: 'Traditional back design suitable for daily wear',
        categoryId: classicCategory?.id,
        variants: [
          { name: 'Simple Regular', description: 'Clean and simple regular back' },
          { name: 'Regular with Dori', description: 'Regular back with traditional dori tie' },
          { name: 'Regular with Buttons', description: 'Regular back with decorative buttons' }
        ]
      },
      {
        name: 'Designer Cut-Out Back',
        type: 'BACK',
        description: 'Modern cut-out back design for a fashionable look',
        categoryId: modernCategory?.id,
        variants: [
          { name: 'Heart Cut-Out', description: 'Romantic heart-shaped cut-out design' },
          { name: 'Geometric Cut-Out', description: 'Modern geometric pattern cut-out' },
          { name: 'Floral Cut-Out', description: 'Delicate floral pattern cut-out' }
        ]
      }
    ];

    // Create front designs
    for (const designData of frontDesigns) {
      const existing = await prisma.blouseDesign.findFirst({
        where: { name: designData.name, type: designData.type }
      });

      if (!existing) {
        const design = await prisma.blouseDesign.create({
          data: {
            name: designData.name,
            type: designData.type,
            description: designData.description,
            categoryId: designData.categoryId,
            isActive: true
          }
        });

        // Create variants for this design
        for (const variantData of designData.variants) {
          await prisma.blouseDesignVariant.create({
            data: {
              name: variantData.name,
              description: variantData.description,
              designId: design.id,
              isActive: true
            }
          });
        }

        console.log(`Created front design: ${designData.name} with ${designData.variants.length} variants`);
      }
    }

    // Create back designs
    for (const designData of backDesigns) {
      const existing = await prisma.blouseDesign.findFirst({
        where: { name: designData.name, type: designData.type }
      });

      if (!existing) {
        const design = await prisma.blouseDesign.create({
          data: {
            name: designData.name,
            type: designData.type,
            description: designData.description,
            categoryId: designData.categoryId,
            isActive: true
          }
        });

        // Create variants for this design
        for (const variantData of designData.variants) {
          await prisma.blouseDesignVariant.create({
            data: {
              name: variantData.name,
              description: variantData.description,
              designId: design.id,
              isActive: true
            }
          });
        }

        console.log(`Created back design: ${designData.name} with ${designData.variants.length} variants`);
      }
    }

  } catch (error) {
    console.error('Error creating demo designs:', error);
    throw error;
  }
}

// Main function to create all demo data
async function createDemoData() {
  try {
    console.log('🚀 Starting demo data creation...');
    
    await createDemoUser();
    await createDemoFabrics();
    await createDemoCategories();
    await createDemoDesigns();
    
    console.log('✅ Demo data created successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');
    console.log('\n🎯 You can now test the custom design blouse purchase flow!');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDemoData();