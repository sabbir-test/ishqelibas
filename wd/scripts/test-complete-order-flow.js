#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Test complete order flow from creation to display
 */

async function testCompleteOrderFlow() {
  console.log('🧪 TESTING COMPLETE ORDER FLOW')
  console.log('==============================\n')

  try {
    // Step 1: Create test user
    const testUser = await prisma.user.upsert({
      where: { email: 'real-customer@gmail.com' },
      update: { isActive: true },
      create: {
        email: 'real-customer@gmail.com',
        name: 'Real Customer',
        password: 'password123',
        isActive: true
      }
    })
    console.log(`👤 Created test user: ${testUser.email}`)

    // Step 2: Create test product
    let testCategory = await prisma.category.findFirst({ where: { name: 'Blouses' } })
    if (!testCategory) {
      testCategory = await prisma.category.create({
        data: { name: 'Blouses', description: 'Beautiful blouses' }
      })
    }

    const testProduct = await prisma.product.upsert({
      where: { sku: 'BLOUSE-REAL-001' },
      update: { isActive: true, stock: 10 },
      create: {
        name: 'Beautiful Silk Blouse',
        description: 'Elegant silk blouse for special occasions',
        price: 2500,
        finalPrice: 2500,
        sku: 'BLOUSE-REAL-001',
        categoryId: testCategory.id,
        stock: 10,
        isActive: true
      }
    })
    console.log(`📦 Created test product: ${testProduct.name}`)

    // Step 3: Create test address
    const testAddress = await prisma.address.create({
      data: {
        userId: testUser.id,
        type: 'Home',
        firstName: 'Real',
        lastName: 'Customer',
        email: testUser.email,
        phone: '9876543210',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    })
    console.log(`📍 Created test address: ${testAddress.city}`)

    // Step 4: Create realistic order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    const testOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: 2500,
        tax: 450,
        shipping: 100,
        total: 3050,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        addressId: testAddress.id,
        notes: 'Regular customer order'
      }
    })
    console.log(`📋 Created realistic order: ${testOrder.orderNumber}`)

    // Step 5: Create order item
    const testOrderItem = await prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        productId: testProduct.id,
        quantity: 1,
        price: 2500
      }
    })
    console.log(`📦 Created order item: ${testOrderItem.id}`)

    // Step 6: Test order retrieval (simulate API call)
    const retrievedOrders = await prisma.order.findMany({
      where: { userId: testUser.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Retrieved ${retrievedOrders.length} orders from database`)

    // Step 7: Test filtering logic
    const { filterLegitimateOrders } = require('../src/lib/order-validation.ts')
    const filteredOrders = filterLegitimateOrders(retrievedOrders)

    console.log(`🔍 Filtering results: ${retrievedOrders.length} -> ${filteredOrders.length}`)

    // Step 8: Verify order appears correctly
    if (filteredOrders.length > 0) {
      const order = filteredOrders[0]
      console.log('✅ ORDER FLOW TEST PASSED')
      console.log(`   - Order Number: ${order.orderNumber}`)
      console.log(`   - Total: ₹${order.total}`)
      console.log(`   - Items: ${order.orderItems.length}`)
      console.log(`   - Status: ${order.status}`)
      console.log(`   - Product: ${order.orderItems[0]?.product?.name}`)
    } else {
      console.log('❌ ORDER FLOW TEST FAILED - No orders after filtering')
    }

    // Step 9: Cleanup
    await prisma.orderItem.delete({ where: { id: testOrderItem.id } })
    await prisma.order.delete({ where: { id: testOrder.id } })
    await prisma.address.delete({ where: { id: testAddress.id } })
    console.log('🧹 Test data cleaned up')

    return {
      success: filteredOrders.length > 0,
      orderCreated: !!testOrder,
      orderRetrieved: retrievedOrders.length > 0,
      orderFiltered: filteredOrders.length > 0,
      orderNumber: testOrder.orderNumber
    }

  } catch (error) {
    console.error('❌ Order flow test failed:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testCompleteOrderFlow()
}

module.exports = { testCompleteOrderFlow }