#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createDemoOrder() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { email: 'demo@example.com' } 
    })
    
    if (!user) {
      console.log('❌ Demo user not found')
      return
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        type: 'Home',
        firstName: 'Demo',
        lastName: 'Customer',
        email: user.email,
        phone: '9876543210',
        address: '456 Demo Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    })

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        status: 'CONFIRMED',
        subtotal: 1800,
        tax: 324,
        shipping: 75,
        total: 2199,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: 'Demo custom blouse order'
      }
    })

    await prisma.customOrder.create({
      data: {
        userId: user.id,
        fabric: 'Cotton Silk',
        fabricColor: '#4CAF50',
        frontDesign: 'Round Neck with Lace',
        backDesign: 'Button Back',
        oldMeasurements: JSON.stringify({
          chest: 34,
          waist: 30,
          blouseLength: 14
        }),
        price: 1800,
        notes: 'Demo custom design'
      }
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: 'custom-blouse',
        quantity: 1,
        price: 1800,
        size: 'S',
        color: 'Green'
      }
    })

    console.log('✅ Demo order created!')
    console.log(`Order: ${order.orderNumber} - ₹${order.total}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoOrder()