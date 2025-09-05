#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestOrder() {
  try {
    console.log('🧪 CREATING TEST ORDER\n')
    
    // Get test user and product
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    const testProduct = await prisma.product.findFirst()
    const testAddress = await prisma.address.findFirst({
      where: { userId: testUser.id }
    })
    
    if (!testUser || !testProduct || !testAddress) {
      console.log('❌ Missing test data')
      return
    }
    
    console.log('📋 Test Data:')
    console.log(`   User: ${testUser.email}`)
    console.log(`   Product: ${testProduct.name} (₹${testProduct.finalPrice})`)
    console.log(`   Address: ${testAddress.city}, ${testAddress.state}`)
    
    // Create order using same logic as API
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    const subtotal = testProduct.finalPrice * 2
    const shipping = subtotal > 999 ? 0 : 99
    const tax = subtotal * 0.18
    const total = subtotal + shipping + tax
    
    console.log('\n💰 Order Calculation:')
    console.log(`   Subtotal: ₹${subtotal}`)
    console.log(`   Shipping: ₹${shipping}`)
    console.log(`   Tax: ₹${tax}`)
    console.log(`   Total: ₹${total}`)
    
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal,
        discount: 0,
        tax,
        shipping,
        total,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: testAddress.id,
        notes: 'Test order created by script'
      }
    })
    
    console.log(`\n✅ Order created: ${order.orderNumber}`)
    
    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: testProduct.id,
        quantity: 2,
        price: testProduct.finalPrice
      }
    })
    
    console.log(`✅ Order item created: ${testProduct.name} x2`)
    
    // Verify order was created correctly
    const createdOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        user: {
          select: { email: true }
        }
      }
    })
    
    console.log('\n📦 CREATED ORDER DETAILS:')
    console.log(`   ID: ${createdOrder.id}`)
    console.log(`   Number: ${createdOrder.orderNumber}`)
    console.log(`   User: ${createdOrder.user.email}`)
    console.log(`   Status: ${createdOrder.status}`)
    console.log(`   Total: ₹${createdOrder.total}`)
    console.log(`   Items: ${createdOrder.orderItems.length}`)
    console.log(`   Address: ${createdOrder.address.city}`)
    console.log(`   Created: ${createdOrder.createdAt}`)
    
    console.log('\n🎉 SUCCESS! Test order created successfully')
    console.log('\n📝 Next Steps:')
    console.log('1. Login as test@example.com / test123')
    console.log('2. Go to /orders page')
    console.log('3. Verify the test order appears')
    console.log('4. Test the checkout flow with new orders')
    
  } catch (error) {
    console.error('❌ Error creating test order:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOrder()