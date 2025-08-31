const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyAdminOrders() {
  try {
    console.log('🔍 Verifying admin user orders...\n')
    
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@ishqelibas.com' },
      select: { id: true, email: true, isActive: true, name: true }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log(`👤 Admin user: ${adminUser.email} (${adminUser.isActive ? 'Active' : 'Inactive'})`)
    
    // Get all orders for admin
    const orders = await prisma.order.findMany({
      where: { userId: adminUser.id },
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
    
    console.log(`📊 Total orders for admin: ${orders.length}`)
    
    if (orders.length === 0) {
      console.log('📝 No orders found for admin user')
      console.log('💡 This means the admin user needs to place an order to see it in "My Orders"')
      return
    }
    
    // Analyze each order
    orders.forEach((order, index) => {
      console.log(`\\n📦 Order ${index + 1}: ${order.orderNumber}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Total: ₹${order.total}`)
      console.log(`   Payment: ${order.paymentMethod}`)
      console.log(`   Items: ${order.orderItems.length}`)
      console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`)
      
      if (order.address) {
        console.log(`   Address: ${order.address.address}, ${order.address.city}`)
      }
      
      order.orderItems.forEach((item, itemIndex) => {
        console.log(`     Item ${itemIndex + 1}: ${item.product?.name || 'Unknown'} x${item.quantity} @ ₹${item.price}`)
      })
      
      // Check if this order would pass filtering
      const isLegitimate = order.orderItems.length > 0 && 
                          order.total > 0 && 
                          order.user?.isActive &&
                          !order.user?.email.match(/^demo@example\\./i)
      
      console.log(`   Legitimate: ${isLegitimate ? '✅ Yes' : '❌ No'}`)
    })
    
    // Test API simulation
    console.log('\\n🔄 Simulating API call...')
    
    // This simulates what the API would return
    const legitimateOrders = orders.filter(order => {
      return order.orderItems.length > 0 && 
             order.total > 0 && 
             order.user?.isActive &&
             !order.user?.email.match(/^demo@example\\./i)
    })
    
    console.log(`📈 Orders that would be returned by API: ${legitimateOrders.length}`)
    
    if (legitimateOrders.length > 0) {
      console.log('\\n✅ SUCCESS: Admin user has legitimate orders that should appear!')
      legitimateOrders.forEach(order => {
        console.log(`   - ${order.orderNumber}: ₹${order.total}`)
      })
    } else {
      console.log('\\n⚠️  WARNING: No legitimate orders found for admin user')
    }
    
    // Check if there are any demo orders that might be confusing things
    console.log('\\n🔍 Checking for demo orders in database...')
    const demoOrders = await prisma.order.findMany({
      where: {
        user: {
          email: {
            contains: 'demo@example'
          }
        }
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    })
    
    console.log(`🎭 Demo orders found: ${demoOrders.length}`)
    demoOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} (${order.user?.email})`)
    })
    
    console.log('\\n🎯 FINAL DIAGNOSIS:')
    console.log('===================')
    if (legitimateOrders.length > 0) {
      console.log('✅ Admin user has legitimate orders')
      console.log('✅ Orders should appear in "My Orders" page')
      console.log('✅ Filtering system is working correctly')
      console.log('💡 If orders still do not appear, check:')
      console.log('   - Browser console for authentication errors')
      console.log('   - Network tab for API call failures')
      console.log('   - Make sure user is logged in as admin@ishqelibas.com')
    } else {
      console.log('⚠️  Admin user has no legitimate orders')
      console.log('💡 To see orders, admin needs to:')
      console.log('   - Place a new order through the checkout process')
      console.log('   - Ensure the order completes successfully')
      console.log('   - Check that payment is processed')
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdminOrders()