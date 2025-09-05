#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnoseCheckoutOrders() {
  try {
    console.log('🔍 CHECKOUT & ORDERS DIAGNOSTIC\n')
    
    // 1. Check all orders in database
    const allOrders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true }
            }
          }
        },
        address: true,
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 TOTAL ORDERS IN DATABASE: ${allOrders.length}\n`)
    
    if (allOrders.length === 0) {
      console.log('❌ NO ORDERS FOUND - This confirms checkout is not working\n')
    } else {
      console.log('📋 ORDER BREAKDOWN:')
      allOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order.orderNumber}`)
        console.log(`   User: ${order.user?.name} (${order.user?.email})`)
        console.log(`   Total: ₹${order.total}`)
        console.log(`   Status: ${order.status}`)
        console.log(`   Items: ${order.orderItems.length}`)
        console.log(`   Created: ${order.createdAt}`)
        console.log(`   Payment: ${order.paymentMethod}`)
        
        // Check if this looks like a dummy order
        const isDummy = order.user?.email?.includes('demo') || 
                       order.user?.email?.includes('test') ||
                       order.orderNumber.includes('DEMO') ||
                       order.total <= 0
        
        if (isDummy) {
          console.log('   🚫 FLAGGED AS DUMMY ORDER')
        } else {
          console.log('   ✅ APPEARS LEGITIMATE')
        }
        console.log('')
      })
    }
    
    // 2. Check users and their cart items
    console.log('👥 USER CART STATUS:')
    const users = await prisma.user.findMany({
      include: {
        cartItems: {
          include: {
            product: {
              select: { name: true, finalPrice: true }
            }
          }
        }
      }
    })
    
    users.forEach(user => {
      console.log(`📧 ${user.email}:`)
      console.log(`   Cart items: ${user.cartItems.length}`)
      if (user.cartItems.length > 0) {
        user.cartItems.forEach(item => {
          console.log(`   - ${item.product.name} x${item.quantity} (₹${item.product.finalPrice})`)
        })
      }
      console.log('')
    })
    
    // 3. Check custom orders
    const customOrders = await prisma.customOrder.findMany({
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })
    
    console.log(`🎨 CUSTOM ORDERS: ${customOrders.length}`)
    customOrders.forEach(order => {
      console.log(`- ${order.user?.email}: ₹${order.price} (${order.status})`)
    })
    
    // 4. Check addresses
    const addresses = await prisma.address.findMany({
      include: {
        user: {
          select: { email: true }
        }
      }
    })
    
    console.log(`\n🏠 ADDRESSES: ${addresses.length}`)
    addresses.forEach(addr => {
      console.log(`- ${addr.user?.email}: ${addr.type} (Default: ${addr.isDefault})`)
    })
    
    // 5. Summary and recommendations
    console.log('\n📋 DIAGNOSTIC SUMMARY:')
    console.log(`✅ Database connection: Working`)
    console.log(`📊 Total orders: ${allOrders.length}`)
    console.log(`👥 Total users: ${users.length}`)
    console.log(`🛒 Users with cart items: ${users.filter(u => u.cartItems.length > 0).length}`)
    console.log(`🎨 Custom orders: ${customOrders.length}`)
    console.log(`🏠 Saved addresses: ${addresses.length}`)
    
    if (allOrders.length === 0) {
      console.log('\n🚨 ISSUE IDENTIFIED: No orders in database')
      console.log('   This confirms the checkout API is not being called or failing')
      console.log('   Next steps: Check frontend checkout flow and API endpoints')
    }
    
  } catch (error) {
    console.error('❌ Diagnostic Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseCheckoutOrders()