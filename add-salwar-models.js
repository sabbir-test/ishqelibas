#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

async function addSalwarKameezModels() {
  const db = new PrismaClient()
  
  try {
    console.log('🎨 Adding Salwar Kameez Models...\n')
    
    const models = [
      {
        name: "Elegant Silk Salwar Kameez",
        designName: "Traditional Silk Design",
        description: "Beautiful traditional silk salwar kameez with intricate embroidery work",
        price: 3500,
        discount: 10,
        finalPrice: 3150,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop",
        isActive: true
      },
      {
        name: "Modern Cotton Salwar Set",
        designName: "Contemporary Cotton Style",
        description: "Comfortable cotton salwar kameez perfect for daily wear",
        price: 2200,
        finalPrice: 2200,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
        isActive: true
      },
      {
        name: "Designer Georgette Suit",
        designName: "Georgette Party Wear",
        description: "Stunning georgette salwar kameez with mirror work and beading",
        price: 4200,
        discount: 15,
        finalPrice: 3570,
        image: "https://images.unsplash.com/photo-1583391733981-24c8d5d3ca84?w=400&h=600&fit=crop",
        isActive: true
      },
      {
        name: "Festive Chiffon Ensemble",
        designName: "Chiffon Festival Collection",
        description: "Elegant chiffon salwar kameez with golden thread work",
        price: 3800,
        discount: 20,
        finalPrice: 3040,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop",
        isActive: true
      },
      {
        name: "Casual Linen Comfort Set",
        designName: "Linen Casual Wear",
        description: "Breathable linen salwar kameez for comfortable everyday wear",
        price: 1800,
        finalPrice: 1800,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop",
        isActive: true
      }
    ]
    
    for (const model of models) {
      // Check if model already exists
      const existing = await db.salwarKameezModel.findFirst({
        where: { name: model.name }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping ${model.name} - already exists`)
        continue
      }
      
      const created = await db.salwarKameezModel.create({
        data: model
      })
      
      console.log(`✅ Created: ${created.name} - ₹${created.finalPrice}`)
    }
    
    // Get final count
    const totalModels = await db.salwarKameezModel.count({
      where: { isActive: true }
    })
    
    console.log(`\n🎉 Total Active Salwar Kameez Models: ${totalModels}`)
    
  } catch (error) {
    console.error('❌ Error adding models:', error.message)
  } finally {
    await db.$disconnect()
  }
}

addSalwarKameezModels()