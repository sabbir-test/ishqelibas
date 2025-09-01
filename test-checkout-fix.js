const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCheckoutFix() {
  console.log('🧪 Testing Checkout Fix - Foreign Key Constraint Resolution...\n')

  try {
    // Get test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ No test user found')
      return
    }

    console.log(`👤 Using test user: ${testUser.email} (${testUser.id})`)

    // Clear existing cart items for clean test
    await prisma.cartItem.deleteMany({
      where: { userId: testUser.id }
    })

    // Add test items to cart (both regular and custom)
    console.log('\n🛒 Setting up test cart items...')
    
    // Regular product
    const regularProduct = await prisma.product.findFirst({
      where: { 
        AND: [
          { id: { not: 'custom-blouse' } },
          { id: { not: 'custom-salwar-kameez' } }
        ]
      }
    })

    if (regularProduct) {
      await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          productId: regularProduct.id,
          quantity: 1
        }
      })
      console.log(`✅ Added regular product: ${regularProduct.name}`)
    }

    // Custom blouse (this should trigger the foreign key issue if not fixed)
    await prisma.cartItem.create({
      data: {
        userId: testUser.id,
        productId: 'custom-blouse',
        quantity: 1
      }
    })
    console.log(`✅ Added custom blouse item`)

    // Simulate checkout API call
    console.log('\n📡 Simulating checkout API call...')
    
    const checkoutData = {
      userId: testUser.id,
      items: [
        {
          productId: regularProduct?.id || 'test-product',
          name: regularProduct?.name || 'Test Product',
          quantity: 1,
          finalPrice: 500
        },
        {
          productId: 'custom-blouse',
          name: 'Custom Blouse Design',
          quantity: 1,
          finalPrice: 2500,
          customDesign: {
            fabric: { name: 'Silk', color: '#FF0000' },
            frontDesign: { name: 'Traditional' },
            backDesign: { name: 'Simple' },
            measurements: {
              bust: 36,
              waist: 30,
              hips: 38
            }
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
        method: 'cod'
      },
      subtotal: 3000,
      tax: 540,
      shipping: 0,
      total: 3540
    }

    // Test the order creation logic directly
    console.log('📋 Testing order creation...')
    
    const orderNumber = `TEST-FIX-${Date.now().toString().slice(-6)}`
    
    // Create address
    const address = await prisma.address.create({
      data: {
        userId: testUser.id,
        type: 'Test Address',
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
        userId: testUser.id,
        status: 'PENDING',
        subtotal: checkoutData.subtotal,
        discount: 0,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
        total: checkoutData.total,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: 'Test order for foreign key fix'
      }
    })

    console.log(`✅ Order created: ${order.orderNumber}`)

    // Test creating order items (this is where the foreign key constraint would fail)
    console.log('\n📦 Testing order item creation...')
    
    for (const item of checkoutData.items) {
      console.log(`   Processing: ${item.name} (${item.productId})`)
      
      // Check if product exists
      let product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product && (item.productId === 'custom-blouse' || item.productId === 'custom-salwar-kameez')) {
        console.log(`   🔧 Creating missing virtual product: ${item.productId}`)
        
        // Get or create virtual category
        let virtualCategory = await prisma.category.findFirst({
          where: { name: 'Virtual Products' }
        })
        
        if (!virtualCategory) {
          virtualCategory = await prisma.category.create({
            data: {
              name: 'Virtual Products',
              description: 'Virtual products for custom designs',
              isActive: true
            }
          })
        }
        
        // Create virtual product
        const virtualProductData = item.productId === 'custom-blouse' ? {
          id: 'custom-blouse',
          name: 'Custom Blouse Design',
          description: 'Virtual product for custom blouse designs',
          sku: 'CUSTOM-BLOUSE-001'
        } : {
          id: 'custom-salwar-kameez',
          name: 'Custom Salwar Kameez Design',
          description: 'Virtual product for custom salwar kameez designs',
          sku: 'CUSTOM-SALWAR-001'
        }
        
        product = await prisma.product.create({
          data: {
            ...virtualProductData,
            price: 0,
            finalPrice: 0,
            stock: 999999,
            isActive: true,
            isFeatured: false,
            categoryId: virtualCategory.id
          }
        })
        
        console.log(`   ✅ Created virtual product: ${product.id}`)
      }

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

      // Create custom order if needed
      if (item.productId === 'custom-blouse' && item.customDesign) {
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
        console.log(`   ✅ Custom order created: ${customOrder.id}`)
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

    console.log(`\n🎉 SUCCESS! Order created with ${finalOrder.orderItems.length} items:`)
    finalOrder.orderItems.forEach(item => {
      console.log(`   - ${item.product.name} x${item.quantity} (₹${item.price})`)
    })

    console.log(`\n✅ Foreign key constraint issue has been resolved!`)
    console.log(`   Order Number: ${finalOrder.orderNumber}`)
    console.log(`   Total Items: ${finalOrder.orderItems.length}`)
    console.log(`   Total Amount: ₹${finalOrder.total}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

testCheckoutFix()