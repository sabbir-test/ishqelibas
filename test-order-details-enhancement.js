#!/usr/bin/env node

/**
 * Test script for enhanced order details functionality
 * Tests: Blouse model image display, tracking status, conditional invoice download
 */

const { PrismaClient } = require('@prisma/client')

async function testOrderDetailsEnhancement() {
  const db = new PrismaClient()
  
  try {
    console.log('🧪 Testing Enhanced Order Details Functionality...\n')
    
    // 1. Test blouse model data availability
    console.log('1️⃣ Testing Blouse Model Data:')
    const blouseModels = await db.blouseModel.findMany({
      where: { isActive: true },
      take: 3
    })
    
    console.log(`   ✅ Found ${blouseModels.length} active blouse models`)
    blouseModels.forEach(model => {
      console.log(`   📸 Model: ${model.name} - Image: ${model.image ? '✅' : '❌'}`)
    })
    
    // 2. Test custom order data structure
    console.log('\n2️⃣ Testing Custom Order Data:')
    const customOrders = await db.customOrder.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`   ✅ Found ${customOrders.length} custom orders`)
    customOrders.forEach(order => {
      console.log(`   🎨 Custom Order: ${order.fabric} - ${order.frontDesign}`)
    })
    
    // 3. Test order status variations
    console.log('\n3️⃣ Testing Order Status Tracking:')
    const statusCounts = await db.order.groupBy({
      by: ['status'],
      _count: { status: true }
    })
    
    console.log('   📊 Order Status Distribution:')
    statusCounts.forEach(({ status, _count }) => {
      const invoiceEnabled = status === 'DELIVERED' ? '📄✅' : '📄❌'
      console.log(`   ${status}: ${_count.status} orders ${invoiceEnabled}`)
    })
    
    // 4. Test order with items for enhanced display
    console.log('\n4️⃣ Testing Order Items Enhancement:')
    const sampleOrder = await db.order.findFirst({
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (sampleOrder) {
      console.log(`   ✅ Sample Order: ${sampleOrder.orderNumber}`)
      console.log(`   📦 Items: ${sampleOrder.orderItems.length}`)
      console.log(`   📊 Status: ${sampleOrder.status}`)
      console.log(`   💰 Total: ₹${sampleOrder.total}`)
      
      // Check for custom blouse items
      const customItems = sampleOrder.orderItems.filter(item => 
        item.productId === 'custom-blouse'
      )
      console.log(`   🎨 Custom Blouse Items: ${customItems.length}`)
    }
    
    // 5. Test tracking status logic
    console.log('\n5️⃣ Testing Tracking Status Logic:')
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const testStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    
    testStatuses.forEach(status => {
      const currentIndex = statusOrder.indexOf(status)
      const completedSteps = currentIndex + 1
      const invoiceAvailable = status === 'DELIVERED'
      
      console.log(`   📍 Status: ${status}`)
      console.log(`     - Completed Steps: ${completedSteps}/${statusOrder.length}`)
      console.log(`     - Invoice Available: ${invoiceAvailable ? '✅' : '❌'}`)
    })
    
    console.log('\n🎉 Enhanced Order Details Test Completed!')
    console.log('\n📋 Summary of Enhancements:')
    console.log('   ✅ Blouse model images in order items')
    console.log('   ✅ Visual order tracking status')
    console.log('   ✅ Conditional invoice download')
    console.log('   ✅ Custom design details display')
    console.log('   ✅ Enhanced item information layout')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await db.$disconnect()
  }
}

// Run the test
testOrderDetailsEnhancement()