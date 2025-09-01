#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

async function testOrderAPIDirect() {
  try {
    console.log('🧪 TESTING ORDER API DIRECTLY\n')
    
    // Get test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.log('❌ No test user found')
      return
    }
    
    // Generate auth token
    const token = jwt.sign({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    }, JWT_SECRET, { expiresIn: '7d' })
    
    console.log('🔑 Generated auth token for:', testUser.email)
    
    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: testUser.id },
      include: { product: true }
    })
    
    if (cartItems.length === 0) {
      console.log('❌ No cart items found')
      return
    }
    
    // Get address
    const address = await prisma.address.findFirst({
      where: { userId: testUser.id }
    })
    
    // Prepare order data
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.finalPrice * item.quantity), 0)
    const shipping = subtotal > 999 ? 0 : 99
    const tax = subtotal * 0.18
    const total = subtotal + shipping + tax
    
    const orderData = {
      userId: testUser.id,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        finalPrice: item.product.finalPrice,
        name: item.product.name,
        size: null,
        color: null
      })),
      shippingInfo: {
        firstName: address?.firstName || 'Test',
        lastName: address?.lastName || 'User',
        email: address?.email || testUser.email,
        phone: address?.phone || '+91 9876543210',
        address: address?.address || '123 Test Street',
        city: address?.city || 'Mumbai',
        state: address?.state || 'Maharashtra',
        zipCode: address?.zipCode || '400001',
        country: address?.country || 'India'
      },
      addressId: address?.id || null,
      paymentInfo: {
        method: 'cod',
        notes: ''
      },
      subtotal,
      tax,
      shipping,
      total
    }
    
    console.log('📦 Order Data:')
    console.log(`   Items: ${orderData.items.length}`)
    console.log(`   Total: ₹${orderData.total}`)
    console.log(`   Address ID: ${orderData.addressId}`)
    
    // Test API call
    console.log('\n🌐 Testing API call...')
    
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `auth-token=${token}`
        },
        body: JSON.stringify(orderData)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log('📡 Response body:', responseText)
      
      if (response.ok) {
        const responseData = JSON.parse(responseText)
        console.log('✅ Order created successfully!')
        console.log('   Order ID:', responseData.order.id)
        console.log('   Order Number:', responseData.order.orderNumber)
      } else {
        console.log('❌ API call failed')
        try {
          const errorData = JSON.parse(responseText)
          console.log('   Error:', errorData.error)
          console.log('   Details:', errorData.details)
        } catch {
          console.log('   Raw error:', responseText)
        }
      }
      
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message)
      console.log('⚠️  Make sure the development server is running on port 3000')
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testOrderAPIDirect()