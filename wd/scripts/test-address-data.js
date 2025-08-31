#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAddressData() {
  try {
    console.log('🔍 Testing Address Data in Orders...\n')
    
    // Get recent orders with address data
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        user: { select: { email: true } }
      }
    })
    
    console.log(`📊 Found ${orders.length} recent orders:\n`)
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.orderNumber}`)
      console.log(`   User: ${order.user.email}`)
      console.log(`   Address ID: ${order.addressId}`)
      
      if (order.address) {
        console.log(`   ✅ Address Data:`)
        console.log(`      Name: ${order.address.firstName} ${order.address.lastName}`)
        console.log(`      Phone: ${order.address.phone}`)
        console.log(`      Address: ${order.address.address}`)
        console.log(`      City: ${order.address.city}, ${order.address.state} ${order.address.zipCode}`)
        console.log(`      Country: ${order.address.country}`)
      } else {
        console.log(`   ❌ No address data found`)
      }
      console.log('')
    })
    
    // Test API response format
    console.log('🧪 Testing API Response Format...\n')
    
    const apiOrders = await prisma.order.findMany({
      take: 1,
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
        address: true,
        user: {
          select: {
            email: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (apiOrders.length > 0) {
      const order = apiOrders[0]
      console.log('📋 Sample API Response Structure:')
      console.log(`Order ID: ${order.id}`)
      console.log(`Order Number: ${order.orderNumber}`)
      console.log(`Address Included: ${!!order.address}`)
      
      if (order.address) {
        console.log('Address Object:')
        console.log(JSON.stringify(order.address, null, 2))
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAddressData()