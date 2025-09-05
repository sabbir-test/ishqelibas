#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkOrder() {
  try {
    console.log('🔍 Checking order ORD-991422...\n')
    
    // Find the order
    const order = await prisma.order.findFirst({
      where: { orderNumber: 'ORD-991422' },
      include: {
        user: { select: { email: true, isActive: true } },
        orderItems: true
      }
    })
    
    if (!order) {
      console.log('❌ Order ORD-991422 not found in database')
      return
    }
    
    console.log('✅ Order found:')
    console.log(`   Order: ${order.orderNumber}`)
    console.log(`   User: ${order.user.email}`)
    console.log(`   User Active: ${order.user.isActive}`)
    console.log(`   Status: ${order.status}`)
    console.log(`   Total: ₹${order.total}`)
    console.log(`   Items: ${order.orderItems.length}`)
    console.log(`   Created: ${order.createdAt}`)
    
    // Check if demo user can see their orders
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@example.com' }
    })
    
    if (demoUser) {
      const demoOrders = await prisma.order.findMany({
        where: { userId: demoUser.id },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log(`\n📊 Demo user has ${demoOrders.length} total orders:`)
      demoOrders.forEach(o => {
        console.log(`   - ${o.orderNumber} (${o.status}) - ₹${o.total}`)
      })
      
      // Check if the specific order belongs to demo user
      const isDemo = order.userId === demoUser.id
      console.log(`\n🔍 Order belongs to demo user: ${isDemo ? '✅ YES' : '❌ NO'}`)
      
      if (!isDemo) {
        console.log(`   Order belongs to: ${order.user.email}`)
        console.log(`   Demo user ID: ${demoUser.id}`)
        console.log(`   Order user ID: ${order.userId}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkOrder()