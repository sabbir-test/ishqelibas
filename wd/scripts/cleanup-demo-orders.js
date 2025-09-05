const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupDemoOrders() {
  try {
    console.log('🧹 Starting cleanup of demo/shared orders...')
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    })
    
    console.log(`Found ${users.length} users`)
    
    // Get all orders
    const allOrders = await prisma.order.findMany({
      select: { id: true, userId: true, orderNumber: true }
    })
    
    console.log(`Found ${allOrders.length} total orders`)
    
    // Check for orphaned orders (orders with non-existent users)
    const validUserIds = new Set(users.map(u => u.id))
    const orphanedOrders = allOrders.filter(order => !validUserIds.has(order.userId))
    
    if (orphanedOrders.length > 0) {
      console.log(`🗑️ Found ${orphanedOrders.length} orphaned orders`)
      
      // Delete orphaned order items first
      for (const order of orphanedOrders) {
        await prisma.orderItem.deleteMany({
          where: { orderId: order.id }
        })
      }
      
      // Delete orphaned orders
      await prisma.order.deleteMany({
        where: {
          id: { in: orphanedOrders.map(o => o.id) }
        }
      })
      
      console.log(`✅ Deleted ${orphanedOrders.length} orphaned orders`)
    }
    
    // Check for duplicate demo orders
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (demoUser) {
      const demoOrders = await prisma.order.findMany({
        where: { userId: demoUser.id },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log(`Demo user has ${demoOrders.length} orders`)
      
      // Keep only the 3 most recent demo orders
      if (demoOrders.length > 3) {
        const ordersToDelete = demoOrders.slice(3)
        
        for (const order of ordersToDelete) {
          await prisma.orderItem.deleteMany({
            where: { orderId: order.id }
          })
        }
        
        await prisma.order.deleteMany({
          where: {
            id: { in: ordersToDelete.map(o => o.id) }
          }
        })
        
        console.log(`✅ Cleaned up ${ordersToDelete.length} excess demo orders`)
      }
    }
    
    // Verify final state
    const finalOrderCount = await prisma.order.count()
    console.log(`📊 Final order count: ${finalOrderCount}`)
    
    // Show orders per user
    const ordersByUser = await prisma.order.groupBy({
      by: ['userId'],
      _count: { id: true }
    })
    
    console.log('\\n📋 Orders per user:')
    for (const userOrders of ordersByUser) {
      const user = users.find(u => u.id === userOrders.userId)
      console.log(`- ${user?.email || 'Unknown'}: ${userOrders._count.id} orders`)
    }
    
    console.log('\\n✅ Cleanup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDemoOrders()