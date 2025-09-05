#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Comprehensive investigation into missing orders issue
 */

async function investigateMissingOrders() {
  console.log('🔍 INVESTIGATING MISSING ORDERS ISSUE')
  console.log('=====================================\n')

  const investigation = {
    databaseConnectivity: false,
    orderCreationProcess: {},
    orderRetrievalProcess: {},
    authenticationFlow: {},
    cacheIssues: {},
    recommendations: []
  }

  try {
    // Step 1: Test Database Connectivity
    console.log('1️⃣ Testing Database Connectivity...')
    await prisma.$connect()
    investigation.databaseConnectivity = true
    console.log('✅ Database connection successful\n')

    // Step 2: Analyze Order Creation Process
    console.log('2️⃣ Analyzing Order Creation Process...')
    
    // Check recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: true,
        user: { select: { id: true, email: true, isActive: true } }
      }
    })

    investigation.orderCreationProcess = {
      totalOrders: await prisma.order.count(),
      recentOrdersCount: recentOrders.length,
      lastOrderCreated: recentOrders[0]?.createdAt || null,
      ordersWithoutItems: await prisma.order.count({
        where: { orderItems: { none: {} } }
      }),
      ordersWithInactiveUsers: recentOrders.filter(o => !o.user?.isActive).length
    }

    console.log(`📊 Total orders in database: ${investigation.orderCreationProcess.totalOrders}`)
    console.log(`📊 Recent orders (last 10): ${investigation.orderCreationProcess.recentOrdersCount}`)
    console.log(`📊 Orders without items: ${investigation.orderCreationProcess.ordersWithoutItems}`)
    console.log(`📊 Orders with inactive users: ${investigation.orderCreationProcess.ordersWithInactiveUsers}`)
    
    if (investigation.orderCreationProcess.lastOrderCreated) {
      console.log(`📊 Last order created: ${investigation.orderCreationProcess.lastOrderCreated}`)
    }
    console.log()

    // Step 3: Test Order Retrieval Logic
    console.log('3️⃣ Testing Order Retrieval Logic...')
    
    // Get all users with orders
    const usersWithOrders = await prisma.user.findMany({
      where: { orders: { some: {} } },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: { select: { id: true, sku: true } }
              }
            }
          }
        }
      }
    })

    investigation.orderRetrievalProcess = {
      usersWithOrders: usersWithOrders.length,
      userOrderCounts: usersWithOrders.map(user => ({
        userId: user.id,
        email: user.email,
        isActive: user.isActive,
        orderCount: user.orders.length,
        latestOrder: user.orders[0]?.createdAt || null
      }))
    }

    console.log(`👥 Users with orders: ${investigation.orderRetrievalProcess.usersWithOrders}`)
    investigation.orderRetrievalProcess.userOrderCounts.forEach(user => {
      console.log(`   - ${user.email}: ${user.orderCount} orders (Active: ${user.isActive})`)
    })
    console.log()

    // Step 4: Check Authentication and User State
    console.log('4️⃣ Checking User Authentication State...')
    
    const activeUsers = await prisma.user.count({ where: { isActive: true } })
    const inactiveUsers = await prisma.user.count({ where: { isActive: false } })
    const usersWithRecentOrders = await prisma.user.count({
      where: {
        isActive: true,
        orders: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      }
    })

    investigation.authenticationFlow = {
      activeUsers,
      inactiveUsers,
      usersWithRecentOrders
    }

    console.log(`👤 Active users: ${activeUsers}`)
    console.log(`👤 Inactive users: ${inactiveUsers}`)
    console.log(`👤 Users with orders in last 24h: ${usersWithRecentOrders}`)
    console.log()

    // Step 5: Simulate Order Filtering Logic
    console.log('5️⃣ Testing Order Filtering Logic...')
    
    // Import validation logic
    const { filterLegitimateOrders } = require('../src/lib/order-validation.ts')
    
    let filteredOrdersCount = 0
    let totalOrdersBeforeFilter = 0
    
    for (const user of usersWithOrders) {
      const userOrders = user.orders.map(order => ({
        ...order,
        user: { email: user.email, isActive: user.isActive }
      }))
      
      totalOrdersBeforeFilter += userOrders.length
      const filteredOrders = filterLegitimateOrders(userOrders)
      filteredOrdersCount += filteredOrders.length
      
      if (userOrders.length !== filteredOrders.length) {
        console.log(`⚠️  User ${user.email}: ${userOrders.length} -> ${filteredOrders.length} orders after filtering`)
      }
    }

    investigation.cacheIssues = {
      totalOrdersBeforeFilter,
      filteredOrdersCount,
      ordersFilteredOut: totalOrdersBeforeFilter - filteredOrdersCount
    }

    console.log(`📊 Orders before filtering: ${totalOrdersBeforeFilter}`)
    console.log(`📊 Orders after filtering: ${filteredOrdersCount}`)
    console.log(`📊 Orders filtered out: ${investigation.cacheIssues.ordersFilteredOut}`)
    console.log()

    // Step 6: Check for Common Issues
    console.log('6️⃣ Checking for Common Issues...')
    
    // Check for orders with zero total
    const ordersWithZeroTotal = await prisma.order.count({
      where: { total: { lte: 0 } }
    })

    // Check total order items
    const totalOrderItems = await prisma.orderItem.count()

    console.log(`🔍 Total order items: ${totalOrderItems}`)
    console.log(`🔍 Orders with zero/negative total: ${ordersWithZeroTotal}`)
    console.log()

    // Step 7: Generate Recommendations
    console.log('7️⃣ Generating Recommendations...')
    
    if (investigation.orderCreationProcess.ordersWithoutItems > 0) {
      investigation.recommendations.push('❌ Found orders without items - check order creation transaction integrity')
    }

    if (investigation.orderCreationProcess.ordersWithInactiveUsers > 0) {
      investigation.recommendations.push('❌ Found orders from inactive users - check user deactivation process')
    }

    if (investigation.cacheIssues.ordersFilteredOut > 0) {
      investigation.recommendations.push(`⚠️  ${investigation.cacheIssues.ordersFilteredOut} orders are being filtered out - review filtering criteria`)
    }

    if (totalOrderItems === 0 && investigation.orderCreationProcess.totalOrders > 0) {
      investigation.recommendations.push('❌ Found orders without order items - check order creation transaction integrity')
    }

    if (ordersWithZeroTotal > 0) {
      investigation.recommendations.push('❌ Found orders with zero/negative totals - check pricing calculation')
    }

    if (investigation.recommendations.length === 0) {
      investigation.recommendations.push('✅ No obvious issues found - check frontend caching and authentication flow')
    }

    investigation.recommendations.forEach(rec => console.log(rec))
    console.log()

    return investigation

  } catch (error) {
    console.error('❌ Investigation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function testOrderCreationFlow() {
  console.log('🧪 TESTING ORDER CREATION FLOW')
  console.log('==============================\n')

  try {
    // Create a test user if not exists
    const testUser = await prisma.user.upsert({
      where: { email: 'test-orders@example.com' },
      update: { isActive: true },
      create: {
        email: 'test-orders@example.com',
        name: 'Test User',
        password: 'test123',
        isActive: true
      }
    })

    console.log(`👤 Test user: ${testUser.email} (ID: ${testUser.id})`)

    // Create a test product if not exists
    let testCategory = await prisma.category.findFirst({ where: { name: 'Test Category' } })
    if (!testCategory) {
      testCategory = await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'Test category for order testing'
        }
      })
    }

    const testProduct = await prisma.product.upsert({
      where: { sku: 'TEST-PRODUCT-001' },
      update: { isActive: true, stock: 10 },
      create: {
        name: 'Test Product',
        description: 'Test product for order testing',
        price: 100,
        finalPrice: 100,
        sku: 'TEST-PRODUCT-001',
        categoryId: testCategory.id,
        stock: 10,
        isActive: true
      }
    })

    console.log(`📦 Test product: ${testProduct.name} (SKU: ${testProduct.sku})`)

    // Create test address
    const testAddress = await prisma.address.create({
      data: {
        userId: testUser.id,
        type: 'Test Address',
        firstName: 'Test',
        lastName: 'User',
        email: testUser.email,
        phone: '1234567890',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456',
        country: 'India'
      }
    })

    console.log(`📍 Test address created: ${testAddress.id}`)

    // Create test order
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
        paymentStatus: 'PENDING',
        addressId: testAddress.id,
        notes: 'Test order for investigation'
      }
    })

    console.log(`📋 Test order created: ${testOrder.orderNumber} (ID: ${testOrder.id})`)

    // Create test order item
    const testOrderItem = await prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        productId: testProduct.id,
        quantity: 1,
        price: 100
      }
    })

    console.log(`📦 Test order item created: ${testOrderItem.id}`)

    // Test retrieval
    const retrievedOrder = await prisma.order.findFirst({
      where: { 
        id: testOrder.id,
        userId: testUser.id 
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: true
      }
    })

    if (retrievedOrder) {
      console.log('✅ Order retrieval successful')
      console.log(`   - Order: ${retrievedOrder.orderNumber}`)
      console.log(`   - Items: ${retrievedOrder.orderItems.length}`)
      console.log(`   - User: ${retrievedOrder.user.email}`)
    } else {
      console.log('❌ Order retrieval failed')
    }

    // Test filtering
    const { filterLegitimateOrders } = require('../src/lib/order-validation.ts')
    const filteredOrders = filterLegitimateOrders([retrievedOrder])
    
    console.log(`🔍 Filtering test: ${filteredOrders.length > 0 ? 'PASSED' : 'FAILED'}`)

    // Cleanup test data
    await prisma.orderItem.delete({ where: { id: testOrderItem.id } })
    await prisma.order.delete({ where: { id: testOrder.id } })
    await prisma.address.delete({ where: { id: testAddress.id } })
    
    console.log('🧹 Test data cleaned up')
    console.log()

    return {
      success: true,
      orderCreated: !!testOrder,
      orderRetrieved: !!retrievedOrder,
      orderFiltered: filteredOrders.length > 0
    }

  } catch (error) {
    console.error('❌ Order creation test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function main() {
  try {
    const investigation = await investigateMissingOrders()
    const creationTest = await testOrderCreationFlow()

    console.log('📋 INVESTIGATION SUMMARY')
    console.log('=======================')
    console.log(`Database Connectivity: ${investigation.databaseConnectivity ? '✅' : '❌'}`)
    console.log(`Total Orders: ${investigation.orderCreationProcess.totalOrders}`)
    console.log(`Orders Filtered Out: ${investigation.cacheIssues.ordersFilteredOut}`)
    console.log(`Order Creation Test: ${creationTest.success ? '✅' : '❌'}`)
    console.log()

    console.log('🔧 RECOMMENDED ACTIONS:')
    investigation.recommendations.forEach(rec => console.log(rec))

  } catch (error) {
    console.error('❌ Investigation failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { investigateMissingOrders, testOrderCreationFlow }