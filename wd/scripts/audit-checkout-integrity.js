#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function auditCheckoutIntegrity() {
  console.log('🔍 CHECKOUT INTEGRITY AUDIT')
  console.log('===========================\n')

  const auditResults = {
    timestamp: new Date().toISOString(),
    databaseState: {},
    checkoutTests: [],
    integrityChecks: {},
    recommendations: []
  }

  try {
    // 1. Database State Analysis
    console.log('1️⃣ Analyzing Database State...')
    
    const dbStats = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({ where: { isActive: true } }),
      totalOrders: await prisma.order.count(),
      totalOrderItems: await prisma.orderItem.count(),
      totalAddresses: await prisma.address.count(),
      recentOrders: await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          orderItems: true
        }
      })
    }
    
    auditResults.databaseState = dbStats
    
    console.log(`📊 Database Statistics:`)
    console.log(`   Users: ${dbStats.totalUsers} (${dbStats.activeUsers} active)`)
    console.log(`   Orders: ${dbStats.totalOrders}`)
    console.log(`   Order Items: ${dbStats.totalOrderItems}`)
    console.log(`   Addresses: ${dbStats.totalAddresses}`)
    
    console.log(`\n📋 Recent Orders:`)
    dbStats.recentOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} (${order.user.email}) - ₹${order.total} - ${order.orderItems.length} items`)
    })

    // 2. Test Multiple User Checkout Scenarios
    console.log('\n2️⃣ Testing Multiple User Checkout Scenarios...')
    
    const testUsers = [
      { email: 'demo@example.com', name: 'Demo User' },
      { email: 'admin@ishqelibas.com', name: 'Admin User' }
    ]

    for (const testUserInfo of testUsers) {
      console.log(`\n🧪 Testing checkout for ${testUserInfo.name}...`)
      
      const user = await prisma.user.findUnique({
        where: { email: testUserInfo.email }
      })
      
      if (!user) {
        console.log(`❌ User ${testUserInfo.email} not found`)
        continue
      }

      const checkoutTest = await performCheckoutTest(user)
      auditResults.checkoutTests.push(checkoutTest)
      
      console.log(`   Result: ${checkoutTest.success ? '✅ PASSED' : '❌ FAILED'}`)
      if (!checkoutTest.success) {
        console.log(`   Error: ${checkoutTest.error}`)
      }
    }

    // 3. Checkout Process Integrity Checks
    console.log('\n3️⃣ Performing Integrity Checks...')
    
    const integrityChecks = {
      orderNumberUniqueness: await checkOrderNumberUniqueness(),
      userOrderAssociation: await checkUserOrderAssociation(),
      orderItemConsistency: await checkOrderItemConsistency(),
      addressLinking: await checkAddressLinking(),
      paymentStatusConsistency: await checkPaymentStatusConsistency()
    }
    
    auditResults.integrityChecks = integrityChecks
    
    Object.entries(integrityChecks).forEach(([check, result]) => {
      console.log(`   ${result.passed ? '✅' : '❌'} ${check}: ${result.message}`)
    })

    // 4. Generate Recommendations
    console.log('\n4️⃣ Generating Recommendations...')
    
    const recommendations = generateRecommendations(auditResults)
    auditResults.recommendations = recommendations
    
    recommendations.forEach(rec => {
      console.log(`   ${rec.priority} ${rec.message}`)
    })

    // 5. Summary Report
    console.log('\n📋 AUDIT SUMMARY')
    console.log('================')
    
    const totalTests = auditResults.checkoutTests.length
    const passedTests = auditResults.checkoutTests.filter(t => t.success).length
    const integrityPassed = Object.values(integrityChecks).filter(c => c.passed).length
    const totalIntegrityChecks = Object.keys(integrityChecks).length
    
    console.log(`Checkout Tests: ${passedTests}/${totalTests} passed`)
    console.log(`Integrity Checks: ${integrityPassed}/${totalIntegrityChecks} passed`)
    console.log(`Database Health: ${dbStats.totalOrders > 0 ? 'Good' : 'No Orders'}`)
    
    const overallHealth = (passedTests === totalTests && integrityPassed === totalIntegrityChecks) ? 'HEALTHY' : 'ISSUES DETECTED'
    console.log(`\n🎯 Overall System Health: ${overallHealth}`)

    return auditResults

  } catch (error) {
    console.error('❌ Audit failed:', error)
    auditResults.error = error.message
    return auditResults
  } finally {
    await prisma.$disconnect()
  }
}

async function performCheckoutTest(user) {
  const testResult = {
    userId: user.id,
    userEmail: user.email,
    timestamp: new Date().toISOString(),
    success: false,
    steps: {},
    error: null
  }

  try {
    // Step 1: Create test product
    const testProduct = await prisma.product.upsert({
      where: { sku: `TEST-${user.id.slice(-6)}` },
      update: { isActive: true, stock: 10 },
      create: {
        name: `Test Product for ${user.email}`,
        description: 'Test product for checkout audit',
        price: 1000,
        finalPrice: 1000,
        sku: `TEST-${user.id.slice(-6)}`,
        categoryId: (await getOrCreateTestCategory()).id,
        stock: 10,
        isActive: true
      }
    })
    testResult.steps.productCreated = true

    // Step 2: Create shipping address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        type: 'Test Address',
        firstName: 'Test',
        lastName: 'User',
        email: user.email,
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456',
        country: 'India'
      }
    })
    testResult.steps.addressCreated = true

    // Step 3: Create order
    const orderNumber = `TEST-${Date.now().toString().slice(-6)}`
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'PENDING',
        subtotal: 1000,
        tax: 180,
        shipping: 99,
        total: 1279,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: 'Checkout integrity test order'
      }
    })
    testResult.steps.orderCreated = true
    testResult.orderNumber = orderNumber
    testResult.orderId = order.id

    // Step 4: Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: testProduct.id,
        quantity: 1,
        price: 1000
      }
    })
    testResult.steps.orderItemCreated = true

    // Step 5: Verify order retrieval
    const retrievedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: { include: { product: true } },
        user: true,
        address: true
      }
    })
    
    if (!retrievedOrder) {
      throw new Error('Order not found after creation')
    }
    testResult.steps.orderRetrieved = true

    // Step 6: Test filtering
    const { filterLegitimateOrders } = require('../src/lib/order-validation.ts')
    const filteredOrders = filterLegitimateOrders([retrievedOrder])
    testResult.steps.orderPassedFilter = filteredOrders.length > 0

    // Cleanup
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
    await prisma.order.delete({ where: { id: order.id } })
    await prisma.address.delete({ where: { id: address.id } })
    testResult.steps.cleanupCompleted = true

    testResult.success = true
    return testResult

  } catch (error) {
    testResult.error = error.message
    return testResult
  }
}

async function getOrCreateTestCategory() {
  return await prisma.category.upsert({
    where: { name: 'Test Category' },
    update: {},
    create: {
      name: 'Test Category',
      description: 'Category for testing purposes'
    }
  })
}

async function checkOrderNumberUniqueness() {
  const duplicates = await prisma.$queryRaw`
    SELECT orderNumber, COUNT(*) as count 
    FROM orders 
    GROUP BY orderNumber 
    HAVING COUNT(*) > 1
  `
  
  return {
    passed: duplicates.length === 0,
    message: duplicates.length === 0 ? 'All order numbers unique' : `${duplicates.length} duplicate order numbers found`
  }
}

async function checkUserOrderAssociation() {
  const orphanOrders = await prisma.order.count({
    where: { user: null }
  })
  
  return {
    passed: orphanOrders === 0,
    message: orphanOrders === 0 ? 'All orders properly associated with users' : `${orphanOrders} orphan orders found`
  }
}

async function checkOrderItemConsistency() {
  const ordersWithoutItems = await prisma.order.count({
    where: { orderItems: { none: {} } }
  })
  
  return {
    passed: ordersWithoutItems === 0,
    message: ordersWithoutItems === 0 ? 'All orders have items' : `${ordersWithoutItems} orders without items`
  }
}

async function checkAddressLinking() {
  const ordersWithoutAddress = await prisma.order.count({
    where: { address: null }
  })
  
  return {
    passed: ordersWithoutAddress === 0,
    message: ordersWithoutAddress === 0 ? 'All orders have addresses' : `${ordersWithoutAddress} orders without addresses`
  }
}

async function checkPaymentStatusConsistency() {
  const invalidPaymentStatus = await prisma.order.count({
    where: {
      paymentStatus: {
        notIn: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']
      }
    }
  })
  
  return {
    passed: invalidPaymentStatus === 0,
    message: invalidPaymentStatus === 0 ? 'All payment statuses valid' : `${invalidPaymentStatus} orders with invalid payment status`
  }
}

function generateRecommendations(auditResults) {
  const recommendations = []
  
  const failedTests = auditResults.checkoutTests.filter(t => !t.success)
  if (failedTests.length > 0) {
    recommendations.push({
      priority: '🔴 HIGH',
      message: `${failedTests.length} checkout tests failed - investigate order creation process`
    })
  }
  
  const failedIntegrityChecks = Object.entries(auditResults.integrityChecks)
    .filter(([_, check]) => !check.passed)
  
  if (failedIntegrityChecks.length > 0) {
    recommendations.push({
      priority: '🟡 MEDIUM',
      message: `${failedIntegrityChecks.length} integrity checks failed - review data consistency`
    })
  }
  
  if (auditResults.databaseState.totalOrders === 0) {
    recommendations.push({
      priority: '🔴 HIGH',
      message: 'No orders in database - checkout process may be completely broken'
    })
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      priority: '✅ INFO',
      message: 'All checks passed - checkout system is healthy'
    })
  }
  
  return recommendations
}

if (require.main === module) {
  auditCheckoutIntegrity()
}

module.exports = { auditCheckoutIntegrity }