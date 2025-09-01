#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixCartProducts() {
  try {
    console.log('🔧 FIXING CART PRODUCT REFERENCES\n')
    
    // Get all cart items with their products
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: true,
        user: { select: { email: true } }
      }
    })
    
    console.log(`Found ${cartItems.length} cart items:`)
    
    for (const item of cartItems) {
      console.log(`- ${item.user.email}: Product ID ${item.productId}`)
      
      if (!item.product) {
        console.log(`  ❌ Product not found, removing cart item`)
        await prisma.cartItem.delete({
          where: { id: item.id }
        })
      } else {
        console.log(`  ✅ Product exists: ${item.product.name}`)
      }
    }
    
    // Get or create valid test product
    let testProduct = await prisma.product.findFirst()
    
    if (!testProduct) {
      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Test Category', description: 'Test' }
      })
      
      testProduct = await prisma.product.create({
        data: {
          name: 'Valid Test Product',
          description: 'Product with valid references',
          price: 1000,
          finalPrice: 1000,
          stock: 100,
          sku: 'VALID-TEST',
          categoryId: category.id
        }
      })
      console.log('✅ Created valid test product')
    }
    
    // Add valid cart items for demo user
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    })
    
    if (demoUser) {
      // Clear existing cart
      await prisma.cartItem.deleteMany({
        where: { userId: demoUser.id }
      })
      
      // Add valid cart item
      await prisma.cartItem.create({
        data: {
          userId: demoUser.id,
          productId: testProduct.id,
          quantity: 2
        }
      })
      
      console.log(`✅ Added valid cart item for ${demoUser.email}`)
    }
    
    console.log('\n🎯 Cart fixed! Ready for checkout testing.')
    
  } catch (error) {
    console.error('❌ Fix Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixCartProducts()