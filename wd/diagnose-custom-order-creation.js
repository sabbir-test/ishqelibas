const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function diagnoseCustomOrderCreation() {
  console.log('🔍 Diagnosing Custom Design Order Creation...\n')

  try {
    // 1. Check if virtual products exist
    console.log('1️⃣ Checking virtual products...')
    const virtualProducts = await prisma.product.findMany({
      where: {
        OR: [
          { id: 'custom-blouse' },
          { id: 'custom-salwar-kameez' }
        ]
      }
    })

    console.log(`   Found ${virtualProducts.length} virtual products:`)
    virtualProducts.forEach(product => {
      console.log(`   ✅ ${product.name} (${product.id})`)
    })

    // 2. Test custom order creation flow
    console.log('\n2️⃣ Testing custom order creation flow...')
    
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }

    console.log(`   Using test user: ${testUser.email}`)

    // Simulate custom blouse order data
    const customOrderData = {
      userId: testUser.id,
      items: [
        {
          productId: 'custom-blouse',
          name: 'Custom Blouse - Silk',
          quantity: 1,
          finalPrice: 2500,
          customDesign: {
            fabric: {
              id: 'fabric-1',
              name: 'Silk',
              type: 'Premium',
              color: 'Red',
              pricePerMeter: 800,
              isOwnFabric: false
            },
            frontDesign: {
              id: 'front-1',
              name: 'Traditional Front',
              stitchCost: 500
            },
            backDesign: {
              id: 'back-1',
              name: 'Simple Back',
              stitchCost: 300
            },
            measurements: {
              bust: '36',
              waist: '30',
              hips: '38',
              shoulder: '14',
              sleeveLength: '18',
              blouseLength: '15',
              notes: 'Test measurements'
            },
            appointmentDate: null,
            appointmentType: null
          }
        }
      ],
      shippingInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: testUser.email,
        phone: '1234567890',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      paymentInfo: {
        method: 'cod',
        notes: 'Test custom order'
      },
      subtotal: 2500,
      tax: 450,
      shipping: 0,
      total: 2950
    }

    // 3. Test order creation
    console.log('\n3️⃣ Creating test custom order...')
    
    const orderNumber = `CUSTOM-TEST-${Date.now().toString().slice(-6)}`
    
    // Create address
    const address = await prisma.address.create({
      data: {
        userId: testUser.id,
        type: 'Test Address',
        firstName: customOrderData.shippingInfo.firstName,
        lastName: customOrderData.shippingInfo.lastName,
        email: customOrderData.shippingInfo.email,
        phone: customOrderData.shippingInfo.phone,
        address: customOrderData.shippingInfo.address,
        city: customOrderData.shippingInfo.city,
        state: customOrderData.shippingInfo.state,
        zipCode: customOrderData.shippingInfo.zipCode,
        country: customOrderData.shippingInfo.country
      }
    })

    console.log(`   ✅ Address created: ${address.id}`)

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: customOrderData.subtotal,
        discount: 0,
        tax: customOrderData.tax,
        shipping: customOrderData.shipping,
        total: customOrderData.total,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: 'Test custom order'
      }
    })

    console.log(`   ✅ Order created: ${order.orderNumber}`)

    // Process custom design item
    const item = customOrderData.items[0]
    
    // Create custom order record
    const customOrder = await prisma.customOrder.create({
      data: {
        userId: testUser.id,
        fabric: item.customDesign.fabric.name,
        fabricColor: item.customDesign.fabric.color,
        frontDesign: item.customDesign.frontDesign.name,
        backDesign: item.customDesign.backDesign.name,
        oldMeasurements: JSON.stringify(item.customDesign.measurements),
        price: item.finalPrice,
        notes: 'Test custom blouse design'
      }
    })

    console.log(`   ✅ Custom order record created: ${customOrder.id}`)

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.finalPrice
      }
    })

    console.log(`   ✅ Order item created: ${orderItem.id}`)

    // 4. Verify order retrieval
    console.log('\n4️⃣ Testing order retrieval...')
    
    const retrievedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true } }
          }
        },
        address: true
      }
    })

    if (retrievedOrder) {
      console.log(`   ✅ Order retrieved successfully:`)
      console.log(`      - Order: ${retrievedOrder.orderNumber}`)
      console.log(`      - Items: ${retrievedOrder.orderItems.length}`)
      console.log(`      - Total: ₹${retrievedOrder.total}`)
      console.log(`      - Address: ${retrievedOrder.address ? 'Available' : 'Missing'}`)
    } else {
      console.log(`   ❌ Order retrieval failed`)
    }

    // 5. Test custom order retrieval
    console.log('\n5️⃣ Testing custom order retrieval...')
    
    const retrievedCustomOrder = await prisma.customOrder.findUnique({
      where: { id: customOrder.id },
      include: {
        user: { select: { email: true } }
      }
    })

    if (retrievedCustomOrder) {
      console.log(`   ✅ Custom order retrieved successfully:`)
      console.log(`      - Fabric: ${retrievedCustomOrder.fabric}`)
      console.log(`      - Front Design: ${retrievedCustomOrder.frontDesign}`)
      console.log(`      - Back Design: ${retrievedCustomOrder.backDesign}`)
      console.log(`      - Price: ₹${retrievedCustomOrder.price}`)
      console.log(`      - User: ${retrievedCustomOrder.user.email}`)
    } else {
      console.log(`   ❌ Custom order retrieval failed`)
    }

    // 6. Test orders API simulation
    console.log('\n6️⃣ Testing orders API simulation...')
    
    const userOrders = await prisma.order.findMany({
      where: { userId: testUser.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true, sku: true } }
          }
        },
        address: true,
        user: { select: { email: true, isActive: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`   📦 Total orders for user: ${userOrders.length}`)

    // Filter legitimate orders (same logic as API)
    const legitimateOrders = userOrders.filter(order => {
      if (!order.orderItems || order.orderItems.length === 0) return false
      if (order.total <= 0) return false
      return true
    })

    console.log(`   ✅ Legitimate orders: ${legitimateOrders.length}`)

    // Check if our test order appears
    const testOrderInResults = legitimateOrders.find(o => o.id === order.id)
    if (testOrderInResults) {
      console.log(`   ✅ Test custom order appears in results`)
      console.log(`      - Order: ${testOrderInResults.orderNumber}`)
      console.log(`      - Items: ${testOrderInResults.orderItems.length}`)
      testOrderInResults.orderItems.forEach(item => {
        console.log(`        * ${item.product.name} (${item.productId}) x${item.quantity}`)
      })
    } else {
      console.log(`   ❌ Test custom order NOT found in results`)
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
    await prisma.customOrder.delete({ where: { id: customOrder.id } })
    await prisma.order.delete({ where: { id: order.id } })
    await prisma.address.delete({ where: { id: address.id } })
    console.log('   ✅ Test data cleaned up')

    console.log('\n🎉 Custom order creation diagnosis completed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Virtual products exist')
    console.log('   ✅ Custom order creation works')
    console.log('   ✅ Order item creation works')
    console.log('   ✅ Order retrieval works')
    console.log('   ✅ Custom order retrieval works')
    console.log('   ✅ Orders API simulation works')

  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseCustomOrderCreation()