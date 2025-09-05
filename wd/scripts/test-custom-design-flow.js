#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCustomDesignFlow() {
  try {
    console.log('🎨 TESTING CUSTOM DESIGN ORDER FLOW')
    console.log('===================================\n')

    // Phase 1: Setup test user
    const testUser = await prisma.user.findFirst({ 
      where: { email: 'admin@ishqelibas.com' } 
    })
    
    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }
    
    console.log(`👤 Test user: ${testUser.email}`)

    // Phase 2: Create test address
    const testAddress = await prisma.address.create({
      data: {
        userId: testUser.id,
        type: 'Home',
        firstName: 'Test',
        lastName: 'Customer',
        email: testUser.email,
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    })
    
    console.log(`📍 Address created: ${testAddress.id}`)

    // Phase 3: Simulate Custom Design Order Creation
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    
    console.log('\n🛍️ Creating custom blouse order...')
    
    // Create main order
    const customOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: 2500,
        discount: 0,
        tax: 450,
        shipping: 100,
        total: 3050,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        addressId: testAddress.id,
        notes: 'Custom blouse design order'
      }
    })
    
    console.log(`📋 Order created: ${customOrder.orderNumber}`)

    // Create custom design record
    const customDesign = await prisma.customOrder.create({
      data: {
        userId: testUser.id,
        fabric: 'Silk Georgette',
        fabricColor: '#FF6B9D',
        frontDesign: 'Boat Neck with Embroidery',
        backDesign: 'Deep V-Back',
        oldMeasurements: JSON.stringify({
          chest: 36,
          waist: 32,
          blouseLength: 15,
          shoulderWidth: 14
        }),
        price: 2500,
        notes: 'Custom design with intricate embroidery work',
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        appointmentType: 'IN_PERSON'
      }
    })
    
    console.log(`🎨 Custom design created: ${customDesign.id}`)

    // Create order item for custom blouse
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: customOrder.id,
        productId: 'custom-blouse',
        quantity: 1,
        price: 2500,
        size: 'M',
        color: 'Pink'
      }
    })
    
    console.log(`📦 Order item created: ${orderItem.id}`)

    // Phase 4: Test Order Retrieval
    console.log('\n🔍 Testing order retrieval...')
    
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
    
    console.log(`📊 Retrieved ${retrievedOrders.length} orders`)
    
    if (retrievedOrders.length > 0) {
      const order = retrievedOrders[0]
      console.log(`✅ Latest order: ${order.orderNumber}`)
      console.log(`   - Items: ${order.orderItems.length}`)
      console.log(`   - Total: ₹${order.total}`)
      console.log(`   - Status: ${order.status}`)
    }

    // Phase 5: Test Order Filtering
    console.log('\n🔍 Testing order filtering...')
    
    const { filterLegitimateOrders } = require('../src/lib/order-validation.ts')
    const filteredOrders = filterLegitimateOrders(retrievedOrders)
    
    console.log(`📊 Filtering: ${retrievedOrders.length} -> ${filteredOrders.length}`)
    
    if (filteredOrders.length !== retrievedOrders.length) {
      console.log('⚠️ Orders being filtered out!')
      const filtered = retrievedOrders.filter(o => 
        !filteredOrders.some(f => f.id === o.id)
      )
      filtered.forEach(order => {
        console.log(`   - Filtered: ${order.orderNumber}`)
      })
    }

    // Phase 6: Test Custom Order Retrieval
    console.log('\n🎨 Testing custom order data...')
    
    const customOrders = await prisma.customOrder.findMany({
      where: { userId: testUser.id }
    })
    
    console.log(`📊 Custom orders: ${customOrders.length}`)
    
    if (customOrders.length > 0) {
      const custom = customOrders[0]
      console.log(`✅ Custom design: ${custom.fabric} - ${custom.frontDesign}`)
    }

    // Phase 7: Cleanup
    console.log('\n🧹 Cleaning up test data...')
    
    await prisma.orderItem.delete({ where: { id: orderItem.id } })
    await prisma.customOrder.delete({ where: { id: customDesign.id } })
    await prisma.order.delete({ where: { id: customOrder.id } })
    await prisma.address.delete({ where: { id: testAddress.id } })
    
    console.log('✅ Test data cleaned up')

    // Phase 8: Summary
    console.log('\n📋 FLOW TEST SUMMARY')
    console.log('====================')
    console.log(`Order Creation: ✅`)
    console.log(`Custom Design: ✅`)
    console.log(`Order Retrieval: ✅`)
    console.log(`Filtering: ${filteredOrders.length === retrievedOrders.length ? '✅' : '⚠️'}`)
    
    return {
      success: true,
      orderCreated: !!customOrder,
      customDesignCreated: !!customDesign,
      orderRetrieved: retrievedOrders.length > 0,
      filteringWorking: filteredOrders.length === retrievedOrders.length
    }

  } catch (error) {
    console.error('❌ Flow test failed:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testCustomDesignFlow()
}

module.exports = { testCustomDesignFlow }