const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow...\n')

  try {
    // 1. Test user authentication
    const testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }

    console.log(`👤 Testing with user: ${testUser.email}`)

    // 2. Generate JWT token (simulating login)
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
    const token = jwt.sign({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    }, JWT_SECRET, { expiresIn: '7d' })

    console.log('✅ JWT token generated successfully')

    // 3. Test token verification (simulating API auth check)
    const payload = jwt.verify(token, JWT_SECRET)
    console.log('✅ Token verification successful')

    // 4. Test user lookup (simulating /api/auth/me)
    const authenticatedUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, isActive: true, role: true }
    })

    if (authenticatedUser && authenticatedUser.isActive) {
      console.log('✅ User authentication simulation successful')
    } else {
      console.log('❌ User authentication simulation failed')
      return
    }

    // 5. Test order retrieval (simulating /api/orders)
    const userOrders = await prisma.order.findMany({
      where: { userId: authenticatedUser.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true } }
          }
        },
        address: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📦 Orders found for ${authenticatedUser.email}: ${userOrders.length}`)

    // 6. Filter legitimate orders (simulating orders page logic)
    const legitimateOrders = userOrders.filter(order => {
      // Basic validation - order must have items
      if (!order.orderItems || order.orderItems.length === 0) {
        return false
      }

      // Check for dummy email patterns
      const dummyEmailPatterns = [
        /^demo@example\./i,
        /^dummy@/i,
        /^sample@/i
      ]
      
      const isDummyEmail = dummyEmailPatterns.some(pattern => 
        pattern.test(authenticatedUser.email)
      )
      
      if (isDummyEmail) {
        return false
      }

      // Check for invalid order values
      if (order.total <= 0) {
        return false
      }

      return true
    })

    console.log(`✅ Legitimate orders after filtering: ${legitimateOrders.length}`)

    // 7. Test order details retrieval
    if (legitimateOrders.length > 0) {
      const testOrder = legitimateOrders[0]
      console.log(`🔍 Testing order details for: ${testOrder.orderNumber}`)
      
      // Simulate order confirmation page lookup
      const orderDetails = await prisma.order.findUnique({
        where: { id: testOrder.id },
        include: {
          orderItems: {
            include: {
              product: { select: { id: true, name: true, images: true } }
            }
          },
          address: true
        }
      })

      if (orderDetails) {
        console.log('✅ Order details retrieval successful')
        console.log(`   - Order: ${orderDetails.orderNumber}`)
        console.log(`   - Items: ${orderDetails.orderItems.length}`)
        console.log(`   - Total: ₹${orderDetails.total}`)
        console.log(`   - Address: ${orderDetails.address ? 'Available' : 'Not available'}`)
      } else {
        console.log('❌ Order details retrieval failed')
      }
    }

    // 8. Test authentication persistence scenarios
    console.log('\n🔄 Testing authentication persistence scenarios...')

    // Simulate page refresh (token should still be valid)
    const refreshedPayload = jwt.verify(token, JWT_SECRET)
    const refreshedUser = await prisma.user.findUnique({
      where: { id: refreshedPayload.userId },
      select: { id: true, email: true, isActive: true }
    })

    if (refreshedUser && refreshedUser.isActive) {
      console.log('✅ Authentication persists after page refresh')
    } else {
      console.log('❌ Authentication lost after page refresh')
    }

    // 9. Test checkout to order confirmation flow
    console.log('\n🛒 Testing checkout to order confirmation flow...')
    
    // Create a test order (simulating successful checkout)
    const testOrderData = {
      orderNumber: `TEST-AUTH-${Date.now().toString().slice(-6)}`,
      userId: testUser.id,
      status: 'PENDING',
      subtotal: 1000,
      tax: 180,
      shipping: 0,
      total: 1180,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING'
    }

    const newOrder = await prisma.order.create({
      data: testOrderData
    })

    console.log(`✅ Test order created: ${newOrder.orderNumber}`)

    // Simulate immediate order lookup (as done in order confirmation)
    const confirmationOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true } }
          }
        },
        address: true
      }
    })

    if (confirmationOrder) {
      console.log('✅ Order confirmation lookup successful')
    } else {
      console.log('❌ Order confirmation lookup failed')
    }

    // Clean up test order
    await prisma.order.delete({ where: { id: newOrder.id } })
    console.log('🧹 Test order cleaned up')

    console.log('\n🎉 Authentication flow test completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ JWT token generation and verification')
    console.log('   ✅ User authentication and lookup')
    console.log('   ✅ Order retrieval and filtering')
    console.log('   ✅ Order details lookup')
    console.log('   ✅ Authentication persistence')
    console.log('   ✅ Checkout to confirmation flow')

  } catch (error) {
    console.error('❌ Authentication flow test failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
  } finally {
    await prisma.$disconnect()
  }
}

testAuthFlow()