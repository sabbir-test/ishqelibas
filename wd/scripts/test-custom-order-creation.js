const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./db/custom.db'
    }
  }
})

async function main() {
  try {
    console.log('🧪 Testing custom order creation...')
    
    // Find demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (!demoUser) {
      console.log('❌ Demo user not found!')
      return
    }
    
    console.log('✅ Demo user found:', demoUser.id)
    
    // Test custom order creation
    const customOrderData = {
      userId: demoUser.id,
      fabric: 'Pure Silk',
      fabricColor: 'Red',
      frontDesign: 'Classic Round Neck',
      backDesign: 'Plain Back',
      measurements: {
        bust: '36',
        waist: '30',
        hips: '38',
        shoulder: '14',
        sleeveLength: '18',
        blouseLength: '15',
        notes: 'Test custom order'
      },
      price: 2999,
      notes: 'Test custom order creation',
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      appointmentType: 'VIRTUAL'
    }
    
    console.log('📝 Creating custom order...')
    
    // Create custom order
    const customOrder = await prisma.customOrder.create({
      data: {
        userId: customOrderData.userId,
        fabric: customOrderData.fabric,
        fabricColor: customOrderData.fabricColor,
        frontDesign: customOrderData.frontDesign,
        backDesign: customOrderData.backDesign,
        oldMeasurements: JSON.stringify(customOrderData.measurements),
        price: customOrderData.price,
        notes: customOrderData.notes,
        appointmentDate: customOrderData.appointmentDate,
        appointmentType: customOrderData.appointmentType
      }
    })
    
    console.log('✅ Custom order created:', customOrder.id)
    
    // Now create a regular order with the custom design item
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    
    console.log('📦 Creating regular order with custom design item...')
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: demoUser.id,
        status: 'PENDING',
        subtotal: customOrderData.price,
        discount: 0,
        tax: customOrderData.price * 0.18,
        shipping: 0,
        total: customOrderData.price * 1.18,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        shippingAddress: JSON.stringify({
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          phone: '+91 98765 43210',
          address: '123 Demo Street',
          city: 'Demo City',
          state: 'Demo State',
          zipCode: '123456',
          country: 'India'
        }),
        notes: 'Test order with custom design'
      }
    })
    
    console.log('✅ Order created:', order.id, 'Order #:', order.orderNumber)
    
    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: 'custom-blouse',
        quantity: 1,
        price: customOrderData.price,
        size: 'M',
        color: 'Red'
      }
    })
    
    console.log('✅ Order item created:', orderItem.id)
    
    // Verify the complete order
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })
    
    console.log('\n📋 Complete order verification:')
    console.log('Order ID:', completeOrder.id)
    console.log('Order Number:', completeOrder.orderNumber)
    console.log('Status:', completeOrder.status)
    console.log('Total:', completeOrder.total)
    console.log('Order Items:', completeOrder.orderItems.length)
    
    completeOrder.orderItems.forEach(item => {
      console.log('- Item:', item.product.name, '(ID:', item.productId, ')')
      console.log('  Quantity:', item.quantity)
      console.log('  Price:', item.price)
    })
    
    console.log('\n🎉 Test completed successfully!')
    console.log('You should now see this order in the "My Orders" page.')
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })