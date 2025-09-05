#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function quickCheckoutTest() {
  try {
    console.log('⚡ QUICK CHECKOUT TEST\n')
    
    // 1. Ensure test user has cart items
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }
    
    // Clear existing cart
    await prisma.cartItem.deleteMany({
      where: { userId: testUser.id }
    })
    
    // Get or create test product
    let testProduct = await prisma.product.findFirst()
    if (!testProduct) {
      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: { name: 'Test Category', description: 'Test' }
      })
      
      testProduct = await prisma.product.create({
        data: {
          name: 'Checkout Test Product',
          description: 'Product for checkout testing',
          price: 500,
          finalPrice: 500,
          stock: 100,
          sku: 'CHECKOUT-TEST',
          categoryId: category.id
        }
      })
    }
    
    // Add to cart
    await prisma.cartItem.create({
      data: {
        userId: testUser.id,
        productId: testProduct.id,
        quantity: 1
      }
    })
    
    console.log('✅ Setup complete:')
    console.log(`   User: ${testUser.email}`)
    console.log(`   Product: ${testProduct.name} (₹${testProduct.finalPrice})`)
    console.log(`   Stock: ${testProduct.stock}`)
    
    // 2. Test order creation manually
    const orderData = {
      userId: testUser.id,
      items: [{
        productId: testProduct.id,
        quantity: 1,
        finalPrice: testProduct.finalPrice,
        name: testProduct.name,
        size: null,
        color: null
      }],
      shippingInfo: {
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
      addressId: null,
      paymentInfo: {
        method: 'cod',
        notes: 'Test order'
      },
      subtotal: 500,
      tax: 90,
      shipping: 99,
      total: 689
    }
    
    console.log('\n🧪 Testing order creation...')
    
    // Generate order number
    const orderNumber = `TEST-${Date.now().toString().slice(-6)}`
    
    // Create address
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
        country: orderData.shippingInfo.country,
        isDefault: false
      }
    })
    
    // Create order
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
        addressId: newAddress.id,
        notes: orderData.paymentInfo.notes
      }
    })
    
    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: orderData.items[0].productId,
        quantity: orderData.items[0].quantity,
        price: orderData.items[0].finalPrice,
        size: orderData.items[0].size,
        color: orderData.items[0].color
      }
    })
    
    // Update stock
    await prisma.product.update({
      where: { id: testProduct.id },
      data: { stock: { decrement: 1 } }
    })
    
    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: testUser.id }
    })
    
    console.log('✅ Order created successfully!')
    console.log(`   Order Number: ${order.orderNumber}`)
    console.log(`   Total: ₹${order.total}`)
    
    // Verify order exists
    const createdOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: true,
        address: true
      }
    })
    
    console.log('\n📋 Verification:')
    console.log(`   Order exists: ${!!createdOrder}`)
    console.log(`   Items count: ${createdOrder.orderItems.length}`)
    console.log(`   Address: ${createdOrder.address.city}`)
    
    console.log('\n🎯 CHECKOUT TEST SUCCESSFUL!')
    console.log('\n📝 Next steps:')
    console.log('1. Login as test@example.com / test123')
    console.log('2. Add items to cart')
    console.log('3. Go to /checkout')
    console.log('4. Complete checkout flow')
    console.log('5. Check browser console for detailed logs')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

quickCheckoutTest()