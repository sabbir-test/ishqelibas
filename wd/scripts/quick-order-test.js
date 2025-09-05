#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function quickOrderTest() {
  try {
    console.log('🔍 Quick Order Investigation\n')
    
    // 1. Check if orders exist
    const totalOrders = await prisma.order.count()
    console.log(`📊 Total orders: ${totalOrders}`)
    
    // 2. Check recent orders
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    })
    
    console.log(`📋 Recent orders:`)
    recentOrders.forEach(order => {
      console.log(`  - ${order.orderNumber} (${order.user.email}) - ${order.status}`)
    })
    
    // 3. Test order creation
    console.log('\n🧪 Testing order creation...')
    
    const testUser = await prisma.user.findFirst({ where: { isActive: true } })
    if (!testUser) {
      console.log('❌ No active users found')
      return
    }
    
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: 100,
        tax: 18,
        shipping: 50,
        total: 168,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING'
      }
    })
    
    console.log(`✅ Test order created: ${testOrder.orderNumber}`)
    
    // 4. Test order retrieval
    const userOrders = await prisma.order.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 User ${testUser.email} has ${userOrders.length} orders`)
    
    // 5. Cleanup
    await prisma.order.delete({ where: { id: testOrder.id } })
    console.log('🧹 Test order cleaned up')
    
    console.log('\n✅ Order system working correctly')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

quickOrderTest()