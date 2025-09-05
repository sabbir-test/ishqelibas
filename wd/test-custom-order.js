const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCustomOrderCreation() {
  console.log('🧪 Testing Custom Order Creation Process...\n')

  try {
    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ No test user found')
      return
    }

    console.log(`👤 Using test user: ${testUser.email} (${testUser.id})`)

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

    // Simulate custom blouse order creation
    console.log('\n📋 Creating custom blouse order...')
    const orderNumber = `CUSTOM-${Date.now().toString().slice(-6)}`
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: 2500,
        discount: 0,
        tax: 450,
        shipping: 0,
        total: 2950,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: testAddress.id,
        notes: 'Custom blouse design order'
      }
    })
    console.log(`✅ Created order: ${order.orderNumber} (${order.id})`)

    // Test creating custom design order item with "custom-blouse" productId
    console.log('\n🎨 Testing custom-blouse order item creation...')
    
    try {
      // First check if "custom-blouse" product exists
      const customProduct = await prisma.product.findUnique({
        where: { id: 'custom-blouse' }
      })
      
      if (!customProduct) {
        console.log('❌ "custom-blouse" product not found in database')
        console.log('   This is likely the cause of the foreign key constraint violation!')
        
        // Create the virtual custom-blouse product
        console.log('   Creating virtual custom-blouse product...')
        const virtualProduct = await prisma.product.create({
          data: {
            id: 'custom-blouse',
            name: 'Custom Blouse Design',
            description: 'Virtual product for custom blouse designs',
            price: 0,
            finalPrice: 0,
            stock: 999999,
            sku: 'CUSTOM-BLOUSE',
            isActive: true,
            isFeatured: false,
            categoryId: (await prisma.category.findFirst()).id // Use first available category
          }
        })
        console.log(`✅ Created virtual product: ${virtualProduct.id}`)
      } else {
        console.log(`✅ Custom product exists: ${customProduct.name}`)
      }
      
      // Now try to create the order item
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: 'custom-blouse',
          quantity: 1,
          price: 2500,
          size: 'Custom',
          color: 'Custom'
        }
      })
      console.log(`✅ Created custom order item: ${orderItem.id}`)
      
    } catch (itemError) {
      console.log(`❌ Failed to create custom order item:`)
      console.log(`   Error: ${itemError.message}`)
      console.log(`   Code: ${itemError.code}`)
      console.log(`   Meta:`, itemError.meta)
    }

    // Test creating custom order record
    console.log('\n🎨 Creating custom order record...')
    try {
      const customOrder = await prisma.customOrder.create({
        data: {
          userId: testUser.id,
          fabric: 'Silk',
          fabricColor: '#FF0000',
          frontDesign: 'Traditional',
          backDesign: 'Simple',
          oldMeasurements: JSON.stringify({
            bust: 36,
            waist: 30,
            hips: 38
          }),
          price: 2500,
          notes: 'Test custom blouse design'
        }
      })
      console.log(`✅ Created custom order: ${customOrder.id}`)
    } catch (customError) {
      console.log(`❌ Failed to create custom order:`)
      console.log(`   Error: ${customError.message}`)
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
      console.log(`     - ${item.product.name} x${item.quantity} (${item.productId})`)
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

testCustomOrderCreation()