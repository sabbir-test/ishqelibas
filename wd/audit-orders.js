const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function auditOrders() {
  try {
    console.log('🔍 Starting order audit...\n')
    
    // Get all orders with related data
    const allOrders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total orders found: ${allOrders.length}\n`)

    // Categorize orders
    const categories = {
      legitimate: [],
      suspicious: [],
      dummy: [],
      noItems: [],
      inactiveUsers: []
    }

    // Dummy patterns
    const dummyPatterns = {
      orderNumbers: [
        /^DEMO-/i,
        /^DUMMY-/i,
        /^SAMPLE-/i,
        /^ORD-(000000|111111|999999)$/i
      ],
      emails: [
        /^demo@example\./i,
        /^dummy@/i,
        /^sample@/i,
        /^fake@/i,
        /^placeholder@/i
      ],
      notes: [
        /\bdemo order\b/i,
        /\bdummy order\b/i,
        /\bsample order\b/i,
        /\bplaceholder\b/i
      ]
    }

    allOrders.forEach(order => {
      let isDummy = false
      let isSuspicious = false
      const issues = []

      // Check order number patterns
      for (const pattern of dummyPatterns.orderNumbers) {
        if (pattern.test(order.orderNumber)) {
          isDummy = true
          issues.push(`Dummy order number: ${order.orderNumber}`)
          break
        }
      }

      // Check user email patterns
      if (order.user?.email) {
        for (const pattern of dummyPatterns.emails) {
          if (pattern.test(order.user.email)) {
            isDummy = true
            issues.push(`Dummy email: ${order.user.email}`)
            break
          }
        }
      }

      // Check notes patterns
      if (order.notes) {
        for (const pattern of dummyPatterns.notes) {
          if (pattern.test(order.notes)) {
            isDummy = true
            issues.push(`Dummy notes: ${order.notes}`)
            break
          }
        }
      }

      // Check for orders without items
      if (!order.orderItems || order.orderItems.length === 0) {
        categories.noItems.push({ order, issues: ['No order items'] })
        return
      }

      // Check for inactive users
      if (order.user && !order.user.isActive) {
        categories.inactiveUsers.push({ order, issues: ['Inactive user'] })
        return
      }

      // Check for suspicious values
      if (order.total <= 0) {
        isSuspicious = true
        issues.push(`Invalid total: ${order.total}`)
      }

      // Categorize
      if (isDummy) {
        categories.dummy.push({ order, issues })
      } else if (isSuspicious) {
        categories.suspicious.push({ order, issues })
      } else {
        categories.legitimate.push({ order, issues })
      }
    })

    // Print results
    console.log('📋 AUDIT RESULTS:')
    console.log('================')
    console.log(`✅ Legitimate orders: ${categories.legitimate.length}`)
    console.log(`⚠️  Suspicious orders: ${categories.suspicious.length}`)
    console.log(`🚫 Dummy orders: ${categories.dummy.length}`)
    console.log(`📦 Orders without items: ${categories.noItems.length}`)
    console.log(`👤 Orders from inactive users: ${categories.inactiveUsers.length}`)
    console.log()

    // Show details for problematic orders
    if (categories.dummy.length > 0) {
      console.log('🚫 DUMMY ORDERS:')
      categories.dummy.forEach(({ order, issues }) => {
        console.log(`  - ${order.orderNumber} (${order.user?.email}) - ${issues.join(', ')}`)
      })
      console.log()
    }

    if (categories.suspicious.length > 0) {
      console.log('⚠️  SUSPICIOUS ORDERS:')
      categories.suspicious.forEach(({ order, issues }) => {
        console.log(`  - ${order.orderNumber} (${order.user?.email}) - ${issues.join(', ')}`)
      })
      console.log()
    }

    if (categories.noItems.length > 0) {
      console.log('📦 ORDERS WITHOUT ITEMS:')
      categories.noItems.forEach(({ order, issues }) => {
        console.log(`  - ${order.orderNumber} (${order.user?.email}) - ${issues.join(', ')}`)
      })
      console.log()
    }

    if (categories.inactiveUsers.length > 0) {
      console.log('👤 ORDERS FROM INACTIVE USERS:')
      categories.inactiveUsers.forEach(({ order, issues }) => {
        console.log(`  - ${order.orderNumber} (${order.user?.email}) - ${issues.join(', ')}`)
      })
      console.log()
    }

    // Show legitimate orders summary
    if (categories.legitimate.length > 0) {
      console.log('✅ LEGITIMATE ORDERS SUMMARY:')
      categories.legitimate.slice(0, 5).forEach(({ order }) => {
        console.log(`  - ${order.orderNumber} | ${order.user?.email} | ₹${order.total} | ${order.status} | ${order.orderItems.length} items`)
      })
      if (categories.legitimate.length > 5) {
        console.log(`  ... and ${categories.legitimate.length - 5} more`)
      }
      console.log()
    }

    // User breakdown
    const userOrders = {}
    allOrders.forEach(order => {
      const email = order.user?.email || 'unknown'
      if (!userOrders[email]) {
        userOrders[email] = { count: 0, total: 0, legitimate: 0 }
      }
      userOrders[email].count++
      userOrders[email].total += order.total
      
      // Check if this order is legitimate
      const isLegitimate = categories.legitimate.some(({ order: legOrder }) => legOrder.id === order.id)
      if (isLegitimate) {
        userOrders[email].legitimate++
      }
    })

    console.log('👥 USER ORDER BREAKDOWN:')
    Object.entries(userOrders)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .forEach(([email, stats]) => {
        console.log(`  ${email}: ${stats.legitimate}/${stats.count} legitimate orders, ₹${stats.total.toFixed(2)} total`)
      })

    return {
      total: allOrders.length,
      legitimate: categories.legitimate.length,
      problematic: categories.dummy.length + categories.suspicious.length + categories.noItems.length + categories.inactiveUsers.length
    }

  } catch (error) {
    console.error('❌ Error during audit:', error)
  } finally {
    await prisma.$disconnect()
  }
}

auditOrders()