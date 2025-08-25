const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./db/custom.db'
    }
  }
})

async function main() {
  try {
    console.log('🔍 Checking database for orders...')
    
    // Find demo user first
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (!demoUser) {
      console.log('❌ Demo user not found!')
      return
    }
    
    console.log('✅ Demo user found:', {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name
    })
    
    // Check all orders for demo user
    const orders = await prisma.order.findMany({
      where: { userId: demoUser.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📋 Found ${orders.length} orders for demo user:`)
    
    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order #${order.orderNumber}`)
      console.log(`   ID: ${order.id}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Total: ₹${order.total}`)
      console.log(`   Created: ${order.createdAt}`)
      console.log(`   Items: ${order.orderItems.length}`)
      
      order.orderItems.forEach(item => {
        console.log(`   - Product: ${item.product.name} (ID: ${item.productId})`)
        console.log(`     Quantity: ${item.quantity}, Price: ₹${item.price}`)
      })
    })
    
    // Check for specific order #ORD-129566
    const specificOrder = await prisma.order.findFirst({
      where: { orderNumber: 'ORD-129566' },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })
    
    if (specificOrder) {
      console.log(`\n✅ Found specific order #ORD-129566:`)
      console.log(`   Order ID: ${specificOrder.id}`)
      console.log(`   User ID: ${specificOrder.userId}`)
      console.log(`   Status: ${specificOrder.status}`)
      console.log(`   Total: ₹${specificOrder.total}`)
      console.log(`   Created: ${specificOrder.createdAt}`)
      console.log(`   Matches demo user: ${specificOrder.userId === demoUser.id ? 'YES' : 'NO'}`)
    } else {
      console.log(`\n❌ Order #ORD-129566 not found in database!`)
    }
    
    // Check custom orders for demo user
    const customOrders = await prisma.customOrder.findMany({
      where: { userId: demoUser.id },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n🎨 Found ${customOrders.length} custom orders for demo user:`)
    customOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Custom Order ID: ${order.id}`)
      console.log(`   Fabric: ${order.fabric}`)
      console.log(`   Front Design: ${order.frontDesign}`)
      console.log(`   Back Design: ${order.backDesign}`)
      console.log(`   Price: ₹${order.price}`)
      console.log(`   Created: ${order.createdAt}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })