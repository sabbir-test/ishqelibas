#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

async function debugOrderAPI() {
  try {
    console.log('🔍 DEBUGGING ORDER API\n')
    
    // Get test user and cart
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.log('❌ No test user found')
      return
    }
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: testUser.id },
      include: { product: true }
    })
    
    const testAddress = await prisma.address.findFirst({
      where: { userId: testUser.id }
    })
    
    console.log('📋 Test Data:')
    console.log(`   User: ${testUser.email} (ID: ${testUser.id})`)
    console.log(`   Cart items: ${cartItems.length}`)
    console.log(`   Address: ${testAddress ? 'Available' : 'Missing'}`)
    
    if (cartItems.length === 0) {
      console.log('⚠️  No cart items - adding test item...')
      
      let testProduct = await prisma.product.findFirst()
      if (!testProduct) {
        const category = await prisma.category.findFirst() || await prisma.category.create({
          data: { name: 'Test Category', description: 'Test' }
        })
        
        testProduct = await prisma.product.create({
          data: {
            name: 'Test Product',
            description: 'Test product for checkout',
            price: 1000,
            finalPrice: 1000,
            stock: 10,
            sku: 'TEST-001',
            categoryId: category.id
          }
        })
      }
      
      await prisma.cartItem.create({
        data: {
          userId: testUser.id,
          productId: testProduct.id,
          quantity: 1
        }
      })
      
      console.log('✅ Added test item to cart')
    }
    
    // Simulate order data from frontend
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
      shippingInfo: testAddress ? {
        firstName: testAddress.firstName,
        lastName: testAddress.lastName,
        email: testAddress.email,
        phone: testAddress.phone,
        address: testAddress.address,
        city: testAddress.city,
        state: testAddress.state,
        zipCode: testAddress.zipCode,
        country: testAddress.country
      } : {
        firstName: 'Test',
        lastName: 'User',
        email: testUser.email,
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      addressId: testAddress?.id || null,
      paymentInfo: {
        method: 'cod',
        notes: ''
      },
      subtotal: 1000,
      tax: 180,
      shipping: 0,
      total: 1180
    }
    
    console.log('\n📦 Order Data:')
    console.log(JSON.stringify(orderData, null, 2))
    
    // Test order creation logic manually
    console.log('\n🧪 Testing Order Creation Logic...')
    
    try {
      // Validate required fields
      if (!orderData.userId || !orderData.items || !orderData.shippingInfo || !orderData.paymentInfo) {
        throw new Error('Missing required fields')
      }
      
      console.log('✅ Required fields validation passed')
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
      console.log(`✅ Generated order number: ${orderNumber}`)
      
      // Check if address creation is needed
      let finalAddressId = orderData.addressId
      if (!finalAddressId) {
        console.log('🏠 Creating new address...')
        const newAddress = await prisma.address.create({
          data: {
            userId: orderData.userId,
            type: "Order Address",
            firstName: orderData.shippingInfo.firstName,
            lastName: orderData.shippingInfo.lastName,
            email: orderData.shippingInfo.email,
            phone: orderData.shippingInfo.phone,
            address: orderData.shippingInfo.address,
            city: orderData.shippingInfo.city,
            state: orderData.shippingInfo.state,
            zipCode: orderData.shippingInfo.zipCode,
            country: orderData.shippingInfo.country || "India",
            isDefault: false
          }
        })
        finalAddressId = newAddress.id
        console.log(`✅ Created address: ${finalAddressId}`)
      }
      
      // Create order
      console.log('💾 Creating order...')
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: orderData.userId,
          status: "PENDING",
          subtotal: orderData.subtotal,
          discount: 0,
          tax: orderData.tax,
          shipping: orderData.shipping,
          total: orderData.total,
          paymentMethod: orderData.paymentInfo.method.toUpperCase(),
          paymentStatus: "PENDING",
          addressId: finalAddressId,
          notes: orderData.paymentInfo.notes || ""
        }
      })
      
      console.log(`✅ Order created: ${order.orderNumber}`)
      
      // Create order items
      console.log('📦 Creating order items...')
      for (const item of orderData.items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.finalPrice,
            size: item.size,
            color: item.color
          }
        })
        console.log(`✅ Created item: ${item.name}`)
      }
      
      console.log('\n🎉 ORDER CREATION SUCCESSFUL!')
      console.log(`   Order ID: ${order.id}`)
      console.log(`   Order Number: ${order.orderNumber}`)
      console.log(`   Total: ₹${order.total}`)
      
    } catch (error) {
      console.error('❌ Order creation failed:', error.message)
      console.error('Stack:', error.stack)
    }
    
  } catch (error) {
    console.error('❌ Debug Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugOrderAPI()