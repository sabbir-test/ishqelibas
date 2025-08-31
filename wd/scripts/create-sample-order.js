#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createSampleOrder() {
  try {
    console.log('🛍️ Creating sample order for testing...')
    
    const user = await prisma.user.findFirst({ 
      where: { email: 'admin@ishqelibas.com' } 
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        type: 'Home',
        firstName: 'Admin',
        lastName: 'User',
        email: user.email,
        phone: '9876543210',
        address: '123 Fashion Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        status: 'PENDING',
        subtotal: 2500,
        tax: 450,
        shipping: 100,
        total: 3050,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: 'Sample custom blouse order'
      }
    })

    // Create custom design
    await prisma.customOrder.create({
      data: {
        userId: user.id,
        fabric: 'Premium Silk',
        fabricColor: '#E91E63',
        frontDesign: 'Elegant Boat Neck',
        backDesign: 'Classic Back',
        oldMeasurements: JSON.stringify({
          chest: 36,
          waist: 32,
          blouseLength: 15
        }),
        price: 2500,
        notes: 'Beautiful custom blouse design'
      }
    })

    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: 'custom-blouse',
        quantity: 1,
        price: 2500,
        size: 'M',
        color: 'Pink'
      }
    })

    console.log('✅ Sample order created successfully!')
    console.log(`Order Number: ${order.orderNumber}`)
    console.log(`Total: ₹${order.total}`)
    console.log('\nNow check "My Orders" section in the app.')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleOrder()