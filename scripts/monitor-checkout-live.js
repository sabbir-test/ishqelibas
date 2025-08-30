#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

let lastOrderCount = 0
let monitoring = true

async function monitorCheckoutLive() {
  console.log('🔴 LIVE CHECKOUT MONITORING')
  console.log('===========================')
  console.log('Monitoring for new orders... (Press Ctrl+C to stop)\n')

  // Get initial order count
  lastOrderCount = await prisma.order.count()
  console.log(`📊 Starting with ${lastOrderCount} orders in database`)
  console.log('👀 Watching for new orders...\n')

  const checkInterval = setInterval(async () => {
    try {
      const currentOrderCount = await prisma.order.count()
      
      if (currentOrderCount > lastOrderCount) {
        const newOrdersCount = currentOrderCount - lastOrderCount
        console.log(`🚨 NEW ORDER(S) DETECTED! (+${newOrdersCount})`)
        
        // Get the new orders
        const newOrders = await prisma.order.findMany({
          take: newOrdersCount,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { email: true } },
            orderItems: { 
              select: { 
                quantity: true, 
                price: true,
                product: { select: { name: true } }
              } 
            },
            address: { select: { city: true, state: true } }
          }
        })
        
        newOrders.forEach(order => {
          console.log(`📋 Order: ${order.orderNumber}`)
          console.log(`   User: ${order.user.email}`)
          console.log(`   Total: ₹${order.total}`)
          console.log(`   Items: ${order.orderItems.length}`)
          console.log(`   Payment: ${order.paymentMethod} (${order.paymentStatus})`)
          console.log(`   Address: ${order.address?.city}, ${order.address?.state}`)
          console.log(`   Created: ${order.createdAt}`)
          console.log(`   Status: ${order.status}`)
          
          if (order.orderItems.length > 0) {
            console.log(`   Products:`)
            order.orderItems.forEach(item => {
              console.log(`     - ${item.product?.name || 'Unknown'} x${item.quantity} @ ₹${item.price}`)
            })
          }
          console.log('')
        })
        
        lastOrderCount = currentOrderCount
      }
      
    } catch (error) {
      console.error('❌ Monitoring error:', error.message)
    }
  }, 2000) // Check every 2 seconds

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping monitor...')
    clearInterval(checkInterval)
    await prisma.$disconnect()
    process.exit(0)
  })
}

async function showCurrentOrders() {
  console.log('📊 CURRENT ORDERS IN DATABASE')
  console.log('==============================\n')
  
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true } },
      orderItems: { select: { quantity: true, price: true } }
    }
  })
  
  if (orders.length === 0) {
    console.log('❌ No orders found in database')
  } else {
    console.log(`Found ${orders.length} orders:`)
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} | ${order.user.email} | ₹${order.total} | ${order.status} | ${order.createdAt.toLocaleString()}`)
    })
  }
  console.log('')
}

if (require.main === module) {
  const command = process.argv[2]
  
  if (command === 'show') {
    showCurrentOrders().then(() => process.exit(0))
  } else {
    monitorCheckoutLive()
  }
}

module.exports = { monitorCheckoutLive, showCurrentOrders }