#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCheckoutFlow() {
  try {
    console.log('🧪 TESTING CHECKOUT FLOW\n')
    
    // 1. Get test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.log('❌ No test user found')
      return
    }
    
    console.log(`👤 Using test user: ${testUser.email}`)
    
    // 2. Get or create a product for testing
    let testProduct = await prisma.product.findFirst()
    
    if (!testProduct) {
      // Create a test product
      const category = await prisma.category.findFirst() || await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'Test category for checkout'
        }
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
      console.log('✅ Created test product')
    }
    
    console.log(`📦 Using product: ${testProduct.name} (₹${testProduct.finalPrice})`)
    
    // 3. Clear existing cart items for test user
    await prisma.cartItem.deleteMany({
      where: { userId: testUser.id }
    })
    
    // 4. Add item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: testUser.id,
        productId: testProduct.id,
        quantity: 2
      }
    })
    
    console.log('✅ Added item to cart')
    
    // 5. Verify cart contents
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: testUser.id },
      include: {
        product: true
      }
    })
    
    console.log(`🛒 Cart contents: ${cartItems.length} items`)
    cartItems.forEach(item => {
      console.log(`   - ${item.product.name} x${item.quantity} = ₹${item.product.finalPrice * item.quantity}`)
    })
    
    // 6. Calculate totals (same as frontend)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.finalPrice * item.quantity), 0)
    const shipping = subtotal > 999 ? 0 : 99
    const tax = subtotal * 0.18
    const total = subtotal + shipping + tax
    
    console.log('\n💰 Order Totals:')
    console.log(`   Subtotal: ₹${subtotal}`)
    console.log(`   Shipping: ₹${shipping}`)
    console.log(`   Tax (18%): ₹${tax}`)
    console.log(`   Total: ₹${total}`)
    
    // 7. Get user's address
    const userAddress = await prisma.address.findFirst({
      where: { userId: testUser.id }
    })
    
    if (userAddress) {
      console.log(`\n🏠 User address: ${userAddress.address}, ${userAddress.city}`)
    } else {
      console.log('\n⚠️  No address found for user')
    }
    
    // 8. Simulate order data (same structure as frontend)
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
      shippingInfo: userAddress ? {
        firstName: userAddress.firstName,
        lastName: userAddress.lastName,
        email: userAddress.email,
        phone: userAddress.phone,
        address: userAddress.address,
        city: userAddress.city,
        state: userAddress.state,
        zipCode: userAddress.zipCode,
        country: userAddress.country
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
      addressId: userAddress?.id || null,
      paymentInfo: {
        method: 'cod',
        notes: ''
      },
      subtotal,
      tax,
      shipping,
      total
    }
    
    console.log('\n📋 Order Data Ready:')
    console.log(`   User ID: ${orderData.userId}`)
    console.log(`   Items: ${orderData.items.length}`)
    console.log(`   Total: ₹${orderData.total}`)
    console.log(`   Payment: ${orderData.paymentInfo.method}`)
    console.log(`   Address ID: ${orderData.addressId || 'New address'}`)
    
    console.log('\n✅ CHECKOUT FLOW TEST COMPLETE')
    console.log('📝 Next steps:')
    console.log('   1. Login as test@example.com / test123')
    console.log('   2. Go to checkout page')
    console.log('   3. Complete shipping and payment steps')
    console.log('   4. Check browser console for API calls')
    console.log('   5. Verify order appears in database')
    
  } catch (error) {
    console.error('❌ Test Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testCheckoutFlow()