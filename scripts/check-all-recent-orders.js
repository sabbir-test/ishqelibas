#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRecentOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { email: true } }
      }
    })
    
    console.log(`📊 Found ${orders.length} recent orders:`)
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database')
    } else {
      orders.forEach(order => {
        console.log(`- ${order.orderNumber} (${order.user.email}) - ₹${order.total} - ${order.createdAt}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecentOrders()