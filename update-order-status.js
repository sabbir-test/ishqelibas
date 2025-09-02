#!/usr/bin/env node

/**
 * Utility to update order status for testing tracking functionality
 */

const { PrismaClient } = require('@prisma/client')

async function updateOrderStatus() {
  const db = new PrismaClient()
  
  try {
    console.log('🔄 Order Status Update Utility\n')
    
    // Get the latest order
    const latestOrder = await db.order.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestOrder) {
      console.log('❌ No orders found')
      return
    }
    
    console.log(`📦 Latest Order: ${latestOrder.orderNumber}`)
    console.log(`📊 Current Status: ${latestOrder.status}`)
    
    // Status progression for testing
    const statusProgression = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PROCESSING', 
      'PROCESSING': 'SHIPPED',
      'SHIPPED': 'DELIVERED',
      'DELIVERED': 'PENDING' // Reset for testing
    }
    
    const newStatus = statusProgression[latestOrder.status] || 'CONFIRMED'
    
    // Update the order status
    const updatedOrder = await db.order.update({
      where: { id: latestOrder.id },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    })
    
    console.log(`✅ Status Updated: ${latestOrder.status} → ${newStatus}`)
    console.log(`📄 Invoice Download: ${newStatus === 'DELIVERED' ? 'ENABLED' : 'DISABLED'}`)
    
    // Show tracking progress
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(newStatus)
    const progress = Math.round(((currentIndex + 1) / statusOrder.length) * 100)
    
    console.log(`📈 Progress: ${progress}% (${currentIndex + 1}/${statusOrder.length} steps)`)
    
    console.log('\n🎯 Test the order details page to see:')
    console.log('   • Updated tracking status visualization')
    console.log('   • Progress indicator changes')
    console.log(`   • Invoice download ${newStatus === 'DELIVERED' ? 'enabled' : 'disabled'}`)
    
  } catch (error) {
    console.error('❌ Error updating order status:', error.message)
  } finally {
    await db.$disconnect()
  }
}

// Run the utility
updateOrderStatus()