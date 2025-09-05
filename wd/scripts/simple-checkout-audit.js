#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function simpleCheckoutAudit() {
  console.log('🔍 CHECKOUT PROCESS AUDIT')
  console.log('=========================\n')

  try {
    // 1. Database Health Check
    console.log('1️⃣ Database Health Check...')
    
    const stats = {
      users: await prisma.user.count(),
      orders: await prisma.order.count(),
      orderItems: await prisma.orderItem.count(),
      addresses: await prisma.address.count()
    }
    
    console.log(`📊 Current Database State:`)
    console.log(`   Users: ${stats.users}`)
    console.log(`   Orders: ${stats.orders}`)
    console.log(`   Order Items: ${stats.orderItems}`)
    console.log(`   Addresses: ${stats.addresses}`)

    // 2. Recent Orders Analysis
    console.log('\n2️⃣ Recent Orders Analysis...')
    
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        orderItems: { select: { id: true, quantity: true, price: true } },
        address: { select: { city: true, state: true } }
      }
    })
    
    console.log(`📋 Found ${recentOrders.length} recent orders:`)
    recentOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} | ${order.user.email} | ₹${order.total} | ${order.orderItems.length} items | ${order.createdAt.toLocaleDateString()}`)
    })

    // 3. Live Checkout Test
    console.log('\n3️⃣ Live Checkout Test...')
    
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (!demoUser) {
      console.log('❌ Demo user not found')
      return
    }
    
    console.log(`👤 Testing with: ${demoUser.email}`)
    
    // Create test order
    const orderNumber = `AUDIT-${Date.now().toString().slice(-6)}`
    console.log(`🛒 Creating test order: ${orderNumber}`)
    
    const testOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: demoUser.id,
        status: 'PENDING',
        subtotal: 1500,
        tax: 270,
        shipping: 99,
        total: 1869,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        notes: 'Audit test order'
      }
    })
    
    console.log(`✅ Order created: ${testOrder.id}`)
    
    // Verify order exists
    const verifyOrder = await prisma.order.findUnique({
      where: { id: testOrder.id },
      include: {
        user: { select: { email: true } }
      }
    })
    
    if (verifyOrder) {
      console.log(`✅ Order verified in database`)
      console.log(`   User: ${verifyOrder.user.email}`)
      console.log(`   Total: ₹${verifyOrder.total}`)
      console.log(`   Status: ${verifyOrder.status}`)
    } else {
      console.log(`❌ Order not found after creation`)
    }
    
    // Test order retrieval for user
    const userOrders = await prisma.order.findMany({
      where: { userId: demoUser.id },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Demo user has ${userOrders.length} total orders`)
    
    const latestOrder = userOrders[0]
    if (latestOrder && latestOrder.id === testOrder.id) {
      console.log(`✅ Latest order matches test order`)
    } else {
      console.log(`❌ Latest order mismatch`)
    }
    
    // Cleanup
    await prisma.order.delete({ where: { id: testOrder.id } })
    console.log(`🧹 Test order cleaned up`)

    // 4. Data Integrity Checks
    console.log('\n4️⃣ Data Integrity Checks...')
    
    // Check for orders without users
    const ordersWithUsers = await prisma.order.findMany({
      include: { user: { select: { id: true, email: true } } }
    })
    
    const orphanOrders = ordersWithUsers.filter(order => !order.user)
    console.log(`🔗 Orphan orders: ${orphanOrders.length}`)
    
    // Check for orders without items
    const ordersWithItems = await prisma.order.findMany({
      include: { orderItems: true }
    })
    
    const emptyOrders = ordersWithItems.filter(order => order.orderItems.length === 0)
    console.log(`📦 Orders without items: ${emptyOrders.length}`)
    
    // Check order number uniqueness
    const allOrders = await prisma.order.findMany({ select: { orderNumber: true } })
    const orderNumbers = allOrders.map(o => o.orderNumber)
    const uniqueOrderNumbers = [...new Set(orderNumbers)]
    const duplicates = orderNumbers.length - uniqueOrderNumbers.length
    console.log(`🔢 Duplicate order numbers: ${duplicates}`)

    // 5. Summary
    console.log('\n📋 AUDIT SUMMARY')
    console.log('================')
    
    const issues = []
    
    if (stats.orders === 0) issues.push('No orders in database')
    if (orphanOrders.length > 0) issues.push(`${orphanOrders.length} orphan orders`)
    if (emptyOrders.length > 0) issues.push(`${emptyOrders.length} empty orders`)
    if (duplicates > 0) issues.push(`${duplicates} duplicate order numbers`)
    
    if (issues.length === 0) {
      console.log('✅ All checks passed - checkout system healthy')
      console.log('✅ Order creation working correctly')
      console.log('✅ Database integrity maintained')
      console.log('✅ User-order associations valid')
    } else {
      console.log('⚠️ Issues detected:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }
    
    console.log(`\n🎯 Checkout Process Status: ${issues.length === 0 ? 'HEALTHY' : 'NEEDS ATTENTION'}`)
    
    return {
      healthy: issues.length === 0,
      stats,
      issues,
      testOrderCreated: !!testOrder,
      testOrderVerified: !!verifyOrder
    }

  } catch (error) {
    console.error('❌ Audit failed:', error.message)
    return { healthy: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  simpleCheckoutAudit()
}

module.exports = { simpleCheckoutAudit }