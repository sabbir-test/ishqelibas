const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function diagnoseForeignKeyConstraints() {
  console.log('🔍 Diagnosing Foreign Key Constraints...\n')

  try {
    // 1. Check Users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, isActive: true }
    })
    console.log(`👥 Users in database: ${users.length}`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.id}) - Active: ${user.isActive}`)
    })

    // 2. Check Products
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, isActive: true }
    })
    console.log(`\n📦 Products in database: ${products.length}`)
    products.forEach(product => {
      console.log(`   - ${product.name} (${product.id}) - SKU: ${product.sku} - Active: ${product.isActive}`)
    })

    // 3. Check Cart Items
    const cartItems = await prisma.cartItem.findMany({
      include: {
        user: { select: { email: true } },
        product: { select: { name: true, isActive: true } }
      }
    })
    console.log(`\n🛒 Cart Items: ${cartItems.length}`)
    cartItems.forEach(item => {
      console.log(`   - User: ${item.user.email}, Product: ${item.product.name} (Active: ${item.product.isActive}), Qty: ${item.quantity}`)
    })

    // 4. Check Orders
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { email: true } },
        orderItems: {
          include: {
            product: { select: { name: true, isActive: true } }
          }
        }
      }
    })
    console.log(`\n📋 Orders: ${orders.length}`)
    orders.forEach(order => {
      console.log(`   - Order ${order.orderNumber}: User ${order.user.email}, Items: ${order.orderItems.length}`)
      order.orderItems.forEach(item => {
        console.log(`     * ${item.product.name} (Active: ${item.product.isActive}) - Qty: ${item.quantity}`)
      })
    })

    // 5. Check Addresses
    const addresses = await prisma.address.findMany({
      include: {
        user: { select: { email: true } }
      }
    })
    console.log(`\n🏠 Addresses: ${addresses.length}`)
    addresses.forEach(addr => {
      console.log(`   - ${addr.firstName} ${addr.lastName} (${addr.user.email}) - ${addr.city}, ${addr.state}`)
    })

    // 6. Check for orphaned cart items (cart items with invalid product/user references)
    console.log('\n🔍 Checking for orphaned cart items...')
    const orphanedCartItems = await prisma.$queryRaw`
      SELECT ci.id, ci.userId, ci.productId, ci.quantity
      FROM cart_items ci
      LEFT JOIN users u ON ci.userId = u.id
      LEFT JOIN products p ON ci.productId = p.id
      WHERE u.id IS NULL OR p.id IS NULL
    `
    console.log(`❌ Orphaned cart items: ${orphanedCartItems.length}`)
    orphanedCartItems.forEach(item => {
      console.log(`   - Cart Item ${item.id}: User ${item.userId}, Product ${item.productId}`)
    })

    // 7. Test order creation with current cart items
    if (cartItems.length > 0 && users.length > 0) {
      console.log('\n🧪 Testing order creation simulation...')
      const testUser = users[0]
      const userCartItems = cartItems.filter(item => item.userId === testUser.id)
      
      if (userCartItems.length > 0) {
        console.log(`Testing with user: ${testUser.email}`)
        console.log(`Cart items for user: ${userCartItems.length}`)
        
        // Check if all products in cart exist and are active
        for (const item of userCartItems) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          })
          
          if (!product) {
            console.log(`❌ Product ${item.productId} not found in database`)
          } else if (!product.isActive) {
            console.log(`⚠️ Product ${product.name} (${item.productId}) is inactive`)
          } else {
            console.log(`✅ Product ${product.name} (${item.productId}) is valid`)
          }
        }
      } else {
        console.log(`No cart items found for user: ${testUser.email}`)
      }
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseForeignKeyConstraints()