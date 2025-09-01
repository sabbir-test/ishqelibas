const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnosing Authentication Issue...\n')

  try {
    // 1. Check users in database
    const users = await prisma.user.findMany({
      select: { id: true, email: true, isActive: true, role: true }
    })
    console.log(`👥 Users in database: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.id}) - Active: ${user.isActive}, Role: ${user.role}`)
    })

    // 2. Check recent orders and their user associations
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, isActive: true } },
        orderItems: { select: { id: true } }
      }
    })
    console.log(`\n📋 Recent orders: ${orders.length}`)
    orders.forEach(order => {
      console.log(`   - ${order.orderNumber}: User ${order.user.email} (Active: ${order.user.isActive}) - ${order.orderItems.length} items`)
    })

    // 3. Test JWT token generation and verification
    console.log('\n🔐 Testing JWT token functionality...')
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
    console.log(`JWT Secret configured: ${JWT_SECRET ? 'Yes' : 'No'}`)
    
    if (users.length > 0) {
      const testUser = users[0]
      const testPayload = {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role
      }
      
      // Generate token
      const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' })
      console.log(`✅ Token generated successfully for ${testUser.email}`)
      
      // Verify token
      try {
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(`✅ Token verification successful:`, {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        })
      } catch (verifyError) {
        console.log(`❌ Token verification failed:`, verifyError.message)
      }
    }

    // 4. Check for authentication-related issues
    console.log('\n🔍 Checking for common authentication issues...')
    
    // Check for users with orders but inactive status
    const inactiveUsersWithOrders = await prisma.user.findMany({
      where: {
        isActive: false,
        orders: { some: {} }
      },
      include: {
        orders: { select: { orderNumber: true } }
      }
    })
    
    if (inactiveUsersWithOrders.length > 0) {
      console.log(`⚠️ Found ${inactiveUsersWithOrders.length} inactive users with orders:`)
      inactiveUsersWithOrders.forEach(user => {
        console.log(`   - ${user.email}: ${user.orders.length} orders`)
      })
    } else {
      console.log(`✅ No inactive users with orders found`)
    }

    // 5. Test order API authentication simulation
    console.log('\n🧪 Simulating order API authentication...')
    
    if (users.length > 0) {
      const testUser = users.find(u => u.isActive) || users[0]
      console.log(`Testing with user: ${testUser.email}`)
      
      // Simulate the authentication flow from the orders API
      const token = jwt.sign({
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role
      }, JWT_SECRET, { expiresIn: '7d' })
      
      // Verify token (as done in API)
      const payload = jwt.verify(token, JWT_SECRET)
      
      // Get user from database (as done in API)
      const authenticatedUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, isActive: true }
      })
      
      if (authenticatedUser && authenticatedUser.isActive) {
        console.log(`✅ Authentication simulation successful for ${authenticatedUser.email}`)
        
        // Test order retrieval
        const userOrders = await prisma.order.findMany({
          where: { userId: authenticatedUser.id },
          include: {
            orderItems: {
              include: {
                product: { select: { id: true, name: true } }
              }
            }
          }
        })
        
        console.log(`📦 Orders found for ${authenticatedUser.email}: ${userOrders.length}`)
        userOrders.forEach(order => {
          console.log(`   - ${order.orderNumber}: ${order.orderItems.length} items`)
        })
      } else {
        console.log(`❌ Authentication simulation failed - user not found or inactive`)
      }
    }

    // 6. Check environment variables
    console.log('\n🔧 Environment check...')
    console.log(`DATABASE_URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`)
    console.log(`JWT_SECRET configured: ${process.env.JWT_SECRET ? 'Yes' : 'No (using fallback)'}`)
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)

  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseAuthIssue()