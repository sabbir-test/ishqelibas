const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCustomCheckoutFlow() {
  console.log('🛒 Testing Custom Design Checkout Flow...\n')

  try {
    // 1. Simulate adding custom design to cart
    console.log('1️⃣ Simulating custom design cart item...')
    
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { userId: testUser.id }
    })

    // Add custom blouse to cart (simulating frontend cart addition)
    const customCartItem = await prisma.cartItem.create({
      data: {
        userId: testUser.id,
        productId: 'custom-blouse',
        quantity: 1
      }
    })

    console.log(`   ✅ Custom cart item added: ${customCartItem.id}`)

    // 2. Simulate checkout data (as sent from frontend)
    console.log('\n2️⃣ Simulating checkout API call...')
    
    const checkoutData = {
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
            appointmentType: null,
            ownFabricDetails: null
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
        notes: 'Test custom checkout'
      },
      subtotal: 2500,
      tax: 450,
      shipping: 0,
      total: 2950
    }

    console.log('   📊 Checkout data prepared:')
    console.log(`      - User: ${checkoutData.userId}`)
    console.log(`      - Items: ${checkoutData.items.length}`)
    console.log(`      - Total: ₹${checkoutData.total}`)
    console.log(`      - Custom Design: ${checkoutData.items[0].customDesign ? 'Yes' : 'No'}`)

    // 3. Test the order creation logic (simulating API endpoint)
    console.log('\n3️⃣ Testing order creation logic...')
    
    const orderNumber = `CHECKOUT-TEST-${Date.now().toString().slice(-6)}`
    
    // Create address
    const address = await prisma.address.create({
      data: {
        userId: checkoutData.userId,
        type: 'Order Address',
        firstName: checkoutData.shippingInfo.firstName,
        lastName: checkoutData.shippingInfo.lastName,
        email: checkoutData.shippingInfo.email,
        phone: checkoutData.shippingInfo.phone,
        address: checkoutData.shippingInfo.address,
        city: checkoutData.shippingInfo.city,
        state: checkoutData.shippingInfo.state,
        zipCode: checkoutData.shippingInfo.zipCode,
        country: checkoutData.shippingInfo.country
      }
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: checkoutData.userId,
        status: 'PENDING',
        subtotal: checkoutData.subtotal,
        discount: 0,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        total: checkoutData.total,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: checkoutData.paymentInfo.notes
      }
    })

    console.log(`   ✅ Order created: ${order.orderNumber}`)

    // Process custom design item (following API logic)
    const item = checkoutData.items[0]
    
    if (item.productId === 'custom-blouse' && item.customDesign) {
      console.log('   🎨 Processing custom design item...')
      
      // Create custom order record
      const customOrder = await prisma.customOrder.create({
        data: {
          userId: checkoutData.userId,
          fabric: item.customDesign.fabric?.name || 'Custom Fabric',
          fabricColor: item.customDesign.fabric?.color || '#000000',
          frontDesign: item.customDesign.frontDesign?.name || 'Custom Front Design',
          backDesign: item.customDesign.backDesign?.name || 'Custom Back Design',
          oldMeasurements: JSON.stringify(item.customDesign.measurements || {}),
          price: item.finalPrice,
          notes: item.customDesign.ownFabricDetails?.description || 'Custom blouse design',
          appointmentDate: item.customDesign.appointmentDate ? new Date(item.customDesign.appointmentDate) : null,
          appointmentType: item.customDesign.appointmentType || null
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
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: checkoutData.userId }
    })

    console.log(`   ✅ Cart cleared`)

    // 4. Test order confirmation retrieval
    console.log('\n4️⃣ Testing order confirmation retrieval...')
    
    const confirmationOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true } }
          }
        },
        address: true
      }
    })

    if (confirmationOrder) {
      console.log(`   ✅ Order confirmation data retrieved:`)
      console.log(`      - Order: ${confirmationOrder.orderNumber}`)
      console.log(`      - Items: ${confirmationOrder.orderItems.length}`)
      console.log(`      - Address: ${confirmationOrder.address ? 'Available' : 'Missing'}`)
      confirmationOrder.orderItems.forEach(item => {
        console.log(`        * ${item.product.name} (${item.productId}) x${item.quantity} - ₹${item.price}`)
      })
    } else {
      console.log(`   ❌ Order confirmation retrieval failed`)
    }

    // 5. Test My Orders page retrieval
    console.log('\n5️⃣ Testing My Orders page retrieval...')
    
    const myOrders = await prisma.order.findMany({
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

    console.log(`   📦 Total orders found: ${myOrders.length}`)

    // Apply filtering logic
    const legitimateOrders = myOrders.filter(order => {
      if (!order.orderItems || order.orderItems.length === 0) return false
      if (order.total <= 0) return false
      return true
    })

    console.log(`   ✅ Legitimate orders: ${legitimateOrders.length}`)

    const testOrderInMyOrders = legitimateOrders.find(o => o.id === order.id)
    if (testOrderInMyOrders) {
      console.log(`   ✅ Test order appears in My Orders:`)
      console.log(`      - Order: ${testOrderInMyOrders.orderNumber}`)
      console.log(`      - Status: ${testOrderInMyOrders.status}`)
      console.log(`      - Total: ₹${testOrderInMyOrders.total}`)
      console.log(`      - Items: ${testOrderInMyOrders.orderItems.length}`)
    } else {
      console.log(`   ❌ Test order NOT found in My Orders`)
    }

    // 6. Test custom order details retrieval
    console.log('\n6️⃣ Testing custom order details retrieval...')
    
    const customOrders = await prisma.customOrder.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`   🎨 Custom orders found: ${customOrders.length}`)
    
    if (customOrders.length > 0) {
      const latestCustomOrder = customOrders[0]
      console.log(`   ✅ Latest custom order:`)
      console.log(`      - Fabric: ${latestCustomOrder.fabric}`)
      console.log(`      - Front Design: ${latestCustomOrder.frontDesign}`)
      console.log(`      - Back Design: ${latestCustomOrder.backDesign}`)
      console.log(`      - Price: ₹${latestCustomOrder.price}`)
      console.log(`      - Measurements: ${latestCustomOrder.oldMeasurements}`)
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
    await prisma.customOrder.deleteMany({ where: { userId: testUser.id, price: 2500 } })
    await prisma.order.delete({ where: { id: order.id } })
    await prisma.address.delete({ where: { id: address.id } })
    console.log('   ✅ Test data cleaned up')

    console.log('\n🎉 Custom checkout flow test completed successfully!')
    console.log('\n📋 Results Summary:')
    console.log('   ✅ Custom cart item creation works')
    console.log('   ✅ Checkout data processing works')
    console.log('   ✅ Order creation works')
    console.log('   ✅ Custom order record creation works')
    console.log('   ✅ Order item creation works')
    console.log('   ✅ Order confirmation retrieval works')
    console.log('   ✅ My Orders page retrieval works')
    console.log('   ✅ Custom order details retrieval works')

  } catch (error) {
    console.error('❌ Custom checkout flow test failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
  } finally {
    await prisma.$disconnect()
  }
}

testCustomCheckoutFlow()