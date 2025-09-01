const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation Process...\n')

  try {
    // Get a test user and their cart items
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ No test user found')
      return
    }

    console.log(`👤 Using test user: ${testUser.email} (${testUser.id})`)

    // Get cart items for this user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: testUser.id },
      include: {
        product: true
      }
    })

    console.log(`🛒 Cart items found: ${cartItems.length}`)
    cartItems.forEach(item => {
      console.log(`   - ${item.product.name} (${item.productId}) - Qty: ${item.quantity}`)
    })

    if (cartItems.length === 0) {
      console.log('⚠️ No cart items found, creating test cart item...')
      
      // Get a test product
      const testProduct = await prisma.product.findFirst()
      if (!testProduct) {
        console.log('❌ No products found in database')
        return
      }

      // Add item to cart
      const newCartItem = await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 1
        }
      })
      console.log(`✅ Created test cart item: ${testProduct.name}`)
      cartItems.push({
        ...newCartItem,
        product: testProduct
      })
    }

    // Create test address
    console.log('\n🏠 Creating test address...')
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
        zipCode: '12345',
        country: 'India'
      }
    })
    console.log(`✅ Created address: ${testAddress.id}`)

    // Simulate order creation
    console.log('\n📋 Creating test order...')
    const orderNumber = `TEST-${Date.now().toString().slice(-6)}`
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: 100,
        discount: 0,
        tax: 18,
        shipping: 0,
        total: 118,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: testAddress.id,
        notes: 'Test order'
      }
    })
    console.log(`✅ Created order: ${order.orderNumber} (${order.id})`)

    // Now try to create order items
    console.log('\n📦 Creating order items...')
    for (const cartItem of cartItems) {
      try {
        console.log(`   Creating item for product: ${cartItem.product.name} (${cartItem.productId})`)
        
        // Verify product exists before creating order item
        const productExists = await prisma.product.findUnique({
          where: { id: cartItem.productId }
        })
        
        if (!productExists) {
          console.log(`   ❌ Product ${cartItem.productId} not found`)
          continue
        }
        
        console.log(`   ✅ Product verified: ${productExists.name}`)
        
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: cartItem.product.finalPrice,
            size: cartItem.size,
            color: cartItem.color
          }
        })
        console.log(`   ✅ Created order item: ${orderItem.id}`)
        
      } catch (itemError) {
        console.log(`   ❌ Failed to create order item:`)
        console.log(`      Error: ${itemError.message}`)
        console.log(`      Code: ${itemError.code}`)
        console.log(`      Meta:`, itemError.meta)
        
        // Log the exact data being used
        console.log(`      Data used:`)
        console.log(`        orderId: ${order.id}`)
        console.log(`        productId: ${cartItem.productId}`)
        console.log(`        quantity: ${cartItem.quantity}`)
        console.log(`        price: ${cartItem.product.finalPrice}`)
      }
    }

    // Verify final order
    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    console.log(`\n📊 Final order verification:`)
    console.log(`   Order: ${finalOrder.orderNumber}`)
    console.log(`   Items: ${finalOrder.orderItems.length}`)
    finalOrder.orderItems.forEach(item => {
      console.log(`     - ${item.product.name} x${item.quantity}`)
    })

  } catch (error) {
    console.error('❌ Error during test:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

testOrderCreation()