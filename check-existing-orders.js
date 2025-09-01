const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkExistingOrders() {
  console.log('📋 Checking Existing Orders in Database...\n')

  try {
    // 1. Get all orders
    const allOrders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, sku: true } }
          }
        },
        address: true,
        user: { select: { email: true, isActive: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total orders in database: ${allOrders.length}\n`)

    // 2. Analyze each order
    allOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderNumber}:`)
      console.log(`   - User: ${order.user.email} (Active: ${order.user.isActive})`)
      console.log(`   - Status: ${order.status}`)
      console.log(`   - Total: ₹${order.total}`)
      console.log(`   - Items: ${order.orderItems.length}`)
      console.log(`   - Created: ${order.createdAt}`)
      
      if (order.orderItems.length > 0) {
        order.orderItems.forEach(item => {
          console.log(`     * ${item.product.name} (${item.productId}) x${item.quantity} - ₹${item.price}`)
        })
      } else {
        console.log(`     ⚠️ NO ITEMS FOUND`)
      }
      
      console.log(`   - Address: ${order.address ? 'Available' : 'Missing'}`)
      console.log('')
    })

    // 3. Apply filtering logic (same as API)
    console.log('🔍 Applying API filtering logic...\n')

    const legitimateOrders = allOrders.filter(order => {
      // Basic validation - order must have items
      if (!order.orderItems || order.orderItems.length === 0) {
        console.log(`🚫 Filtering out ${order.orderNumber}: No items`)
        return false
      }

      // Check for dummy email patterns
      const dummyEmailPatterns = [
        /^demo@example\./i,
        /^dummy@/i,
        /^sample@/i,
        /^fake@/i,
        /^placeholder@/i,
        /^noreply@/i,
        /^donotreply@/i
      ]
      
      const isDummyEmail = dummyEmailPatterns.some(pattern => 
        pattern.test(order.user?.email || '')
      )
      
      if (isDummyEmail) {
        console.log(`🚫 Filtering out ${order.orderNumber}: Dummy email ${order.user?.email}`)
        return false
      }

      // Check for dummy order number patterns
      const dummyOrderPatterns = [
        /^DEMO-/i,
        /^DUMMY-/i,
        /^SAMPLE-/i,
        /^ORD-(000000|111111|999999)$/i
      ]
      
      const isDummyOrder = dummyOrderPatterns.some(pattern => 
        pattern.test(order.orderNumber)
      )
      
      if (isDummyOrder) {
        console.log(`🚫 Filtering out ${order.orderNumber}: Dummy order pattern`)
        return false
      }

      // Check for invalid order values
      if (order.total <= 0) {
        console.log(`🚫 Filtering out ${order.orderNumber}: Invalid total ${order.total}`)
        return false
      }

      console.log(`✅ ${order.orderNumber} passes all filters`)
      return true
    })

    console.log(`\n📈 Filtering Results:`)
    console.log(`   - Total orders: ${allOrders.length}`)
    console.log(`   - Legitimate orders: ${legitimateOrders.length}`)
    console.log(`   - Filtered out: ${allOrders.length - legitimateOrders.length}`)

    // 4. Check custom orders
    console.log('\n🎨 Checking Custom Orders...')
    
    const customOrders = await prisma.customOrder.findMany({
      include: {
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total custom orders: ${customOrders.length}\n`)

    customOrders.forEach((customOrder, index) => {
      console.log(`${index + 1}. Custom Order ${customOrder.id}:`)
      console.log(`   - User: ${customOrder.user.email}`)
      console.log(`   - Fabric: ${customOrder.fabric}`)
      console.log(`   - Front Design: ${customOrder.frontDesign}`)
      console.log(`   - Back Design: ${customOrder.backDesign}`)
      console.log(`   - Price: ₹${customOrder.price}`)
      console.log(`   - Status: ${customOrder.status}`)
      console.log(`   - Created: ${customOrder.createdAt}`)
      console.log('')
    })

    // 5. Check for orders with custom design items
    console.log('🔍 Checking orders with custom design items...')
    
    const customDesignOrders = allOrders.filter(order => 
      order.orderItems.some(item => 
        item.productId === 'custom-blouse' || item.productId === 'custom-salwar-kameez'
      )
    )

    console.log(`📊 Orders with custom design items: ${customDesignOrders.length}\n`)

    customDesignOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber}:`)
      console.log(`   - User: ${order.user.email}`)
      console.log(`   - Total: ₹${order.total}`)
      console.log(`   - Custom Items:`)
      order.orderItems
        .filter(item => item.productId === 'custom-blouse' || item.productId === 'custom-salwar-kameez')
        .forEach(item => {
          console.log(`     * ${item.product.name} (${item.productId}) x${item.quantity} - ₹${item.price}`)
        })
      console.log('')
    })

    // 6. Check for potential issues
    console.log('⚠️ Potential Issues Found:')
    
    const ordersWithoutItems = allOrders.filter(order => order.orderItems.length === 0)
    if (ordersWithoutItems.length > 0) {
      console.log(`   - ${ordersWithoutItems.length} orders have no items`)
      ordersWithoutItems.forEach(order => {
        console.log(`     * ${order.orderNumber} (${order.user.email})`)
      })
    }

    const ordersWithZeroTotal = allOrders.filter(order => order.total <= 0)
    if (ordersWithZeroTotal.length > 0) {
      console.log(`   - ${ordersWithZeroTotal.length} orders have zero or negative total`)
    }

    const inactiveUserOrders = allOrders.filter(order => !order.user.isActive)
    if (inactiveUserOrders.length > 0) {
      console.log(`   - ${inactiveUserOrders.length} orders belong to inactive users`)
    }

    if (ordersWithoutItems.length === 0 && ordersWithZeroTotal.length === 0 && inactiveUserOrders.length === 0) {
      console.log(`   ✅ No major issues found`)
    }

  } catch (error) {
    console.error('❌ Error checking orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingOrders()