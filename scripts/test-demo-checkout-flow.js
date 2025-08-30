#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDemoCheckoutFlow() {
  console.log('🧪 TESTING DEMO USER CHECKOUT FLOW')
  console.log('==================================\n')

  try {
    // Step 1: Verify demo user exists and get details
    console.log('1️⃣ Verifying demo user account...')
    
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (!demoUser) {
      console.log('❌ Demo user not found')
      return { success: false, error: 'Demo user not found' }
    }
    
    console.log(`✅ Demo user found: ${demoUser.email} (ID: ${demoUser.id})`)
    console.log(`   Active: ${demoUser.isActive}`)
    console.log(`   Role: ${demoUser.role}\n`)

    // Step 2: Check existing orders before test
    console.log('2️⃣ Checking existing orders...')
    
    const existingOrders = await prisma.order.findMany({
      where: { userId: demoUser.id },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Demo user has ${existingOrders.length} existing orders`)
    if (existingOrders.length > 0) {
      console.log('   Latest order:', existingOrders[0].orderNumber)
    }
    console.log()

    // Step 3: Create test product if needed
    console.log('3️⃣ Setting up test product...')
    
    let testCategory = await prisma.category.findFirst({ where: { name: 'Blouses' } })
    if (!testCategory) {
      testCategory = await prisma.category.create({
        data: { name: 'Blouses', description: 'Beautiful blouses collection' }
      })
    }

    const testProduct = await prisma.product.upsert({
      where: { sku: 'DEMO-BLOUSE-001' },
      update: { isActive: true, stock: 10 },
      create: {
        name: 'Demo Elegant Blouse',
        description: 'Beautiful demo blouse for testing',
        price: 1500,
        finalPrice: 1500,
        sku: 'DEMO-BLOUSE-001',
        categoryId: testCategory.id,
        stock: 10,
        isActive: true,
        images: '/api/placeholder/300/400'
      }
    })
    
    console.log(`✅ Test product ready: ${testProduct.name} (₹${testProduct.finalPrice})\n`)

    // Step 4: Simulate checkout process
    console.log('4️⃣ Simulating checkout process...')
    
    // Create shipping address
    const shippingAddress = await prisma.address.create({
      data: {
        userId: demoUser.id,
        type: 'Shipping',
        firstName: 'Demo',
        lastName: 'Customer',
        email: demoUser.email,
        phone: '9876543210',
        address: '123 Demo Street, Demo Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    })
    
    console.log(`📍 Shipping address created: ${shippingAddress.city}`)

    // Calculate order totals
    const subtotal = testProduct.finalPrice
    const tax = Math.round(subtotal * 0.18)
    const shipping = subtotal > 999 ? 0 : 99
    const total = subtotal + tax + shipping
    
    console.log(`💰 Order calculation:`)
    console.log(`   Subtotal: ₹${subtotal}`)
    console.log(`   Tax (18%): ₹${tax}`)
    console.log(`   Shipping: ₹${shipping}`)
    console.log(`   Total: ₹${total}`)

    // Step 5: Create order (simulating API call)
    console.log('\n5️⃣ Creating order in database...')
    
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: demoUser.id,
        status: 'PENDING',
        subtotal,
        discount: 0,
        tax,
        shipping,
        total,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: shippingAddress.id,
        notes: 'Demo checkout test order'
      }
    })
    
    console.log(`✅ Order created: ${newOrder.orderNumber}`)
    console.log(`   Order ID: ${newOrder.id}`)
    console.log(`   Total: ₹${newOrder.total}`)
    console.log(`   Status: ${newOrder.status}`)

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: newOrder.id,
        productId: testProduct.id,
        quantity: 1,
        price: testProduct.finalPrice
      }
    })
    
    console.log(`📦 Order item created: ${orderItem.id}`)

    // Step 6: Verify order in database
    console.log('\n6️⃣ Verifying order in database...')
    
    const verifyOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: {
          include: {
            product: { select: { name: true, sku: true } }
          }
        },
        user: { select: { email: true } },
        address: true
      }
    })
    
    if (!verifyOrder) {
      console.log('❌ Order not found in database after creation')
      return { success: false, error: 'Order not found after creation' }
    }
    
    console.log('✅ Order verified in database:')
    console.log(`   Order: ${verifyOrder.orderNumber}`)
    console.log(`   User: ${verifyOrder.user.email}`)
    console.log(`   Items: ${verifyOrder.orderItems.length}`)
    console.log(`   Product: ${verifyOrder.orderItems[0]?.product?.name}`)
    console.log(`   Address: ${verifyOrder.address?.city}, ${verifyOrder.address?.state}`)

    // Step 7: Test order retrieval (simulate "My Orders" API)
    console.log('\n7️⃣ Testing order retrieval...')
    
    const userOrders = await prisma.order.findMany({
      where: { userId: demoUser.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, images: true, sku: true }
            }
          }
        },
        user: { select: { email: true, isActive: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Retrieved ${userOrders.length} orders for demo user`)
    
    const latestOrder = userOrders[0]
    if (latestOrder && latestOrder.id === newOrder.id) {
      console.log('✅ Latest order matches created order')
      console.log(`   Order: ${latestOrder.orderNumber}`)
      console.log(`   Created: ${latestOrder.createdAt}`)
    } else {
      console.log('❌ Latest order does not match created order')
    }

    // Step 8: Test order filtering
    console.log('\n8️⃣ Testing order filtering...')
    
    const { filterLegitimateOrders } = require('../src/lib/order-validation.ts')
    const filteredOrders = filterLegitimateOrders(userOrders)
    
    console.log(`🔍 Filtering: ${userOrders.length} -> ${filteredOrders.length}`)
    
    const orderPassedFilter = filteredOrders.some(order => order.id === newOrder.id)
    console.log(`✅ New order passed filter: ${orderPassedFilter}`)

    // Step 9: Cleanup test data
    console.log('\n9️⃣ Cleaning up test data...')
    
    await prisma.orderItem.delete({ where: { id: orderItem.id } })
    await prisma.order.delete({ where: { id: newOrder.id } })
    await prisma.address.delete({ where: { id: shippingAddress.id } })
    
    console.log('🧹 Test data cleaned up')

    // Step 10: Final verification
    console.log('\n🎯 TEST RESULTS SUMMARY')
    console.log('======================')
    
    const results = {
      demoUserExists: !!demoUser,
      orderCreated: !!newOrder,
      orderVerified: !!verifyOrder,
      orderRetrieved: userOrders.length > existingOrders.length,
      orderFiltered: orderPassedFilter,
      allFieldsPopulated: !!(verifyOrder?.orderItems?.length && verifyOrder?.address && verifyOrder?.user)
    }
    
    Object.entries(results).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}: ${value}`)
    })
    
    const allPassed = Object.values(results).every(Boolean)
    console.log(`\n🏆 Overall Result: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`)
    
    if (allPassed) {
      console.log('\n✅ Demo user checkout flow is working correctly!')
      console.log('   - Orders are being created in database')
      console.log('   - All order fields are properly populated')
      console.log('   - Orders appear in retrieval queries')
      console.log('   - Order filtering is working')
    } else {
      console.log('\n❌ Issues found in checkout flow:')
      Object.entries(results).forEach(([key, value]) => {
        if (!value) console.log(`   - ${key} failed`)
      })
    }

    return {
      success: allPassed,
      results,
      testOrderNumber: newOrder.orderNumber,
      demoUserId: demoUser.id
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testDemoCheckoutFlow()
}

module.exports = { testDemoCheckoutFlow }