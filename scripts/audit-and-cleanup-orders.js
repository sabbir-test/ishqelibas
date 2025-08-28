#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Patterns to identify dummy/demo orders
const DUMMY_PATTERNS = {
  orderNumbers: [
    /^(DEMO|TEST|DUMMY|SAMPLE)-/i,
    /^ORD-(000000|111111|123456|999999)$/,
    /^(TEST|DEMO)_ORDER_/i
  ],
  notes: [
    /demo/i,
    /test/i,
    /dummy/i,
    /sample/i,
    /placeholder/i,
    /fake/i
  ],
  userEmails: [
    /demo@/i,
    /test@/i,
    /dummy@/i,
    /sample@/i,
    /fake@/i,
    /@example\./i,
    /@test\./i
  ],
  addressPatterns: [
    /demo/i,
    /test/i,
    /dummy/i,
    /sample/i,
    /123 fake/i,
    /placeholder/i
  ]
}

// Validation criteria for legitimate orders
const VALIDATION_CRITERIA = {
  minOrderValue: 1, // Minimum order value
  validPaymentMethods: ['RAZORPAY', 'COD'],
  validStatuses: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
}

async function auditOrders() {
  console.log('🔍 Starting order audit...\n')
  
  try {
    // Get all orders with related data
    const allOrders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true
          }
        },
        address: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            city: true,
            phone: true
          }
        },
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
        }
      }
    })

    console.log(`📊 Total orders found: ${allOrders.length}`)
    
    const auditResults = {
      legitimate: [],
      suspicious: [],
      toDelete: []
    }

    // Audit each order
    for (const order of allOrders) {
      const issues = []
      let isDummy = false
      let isSuspicious = false

      // Check order number patterns
      for (const pattern of DUMMY_PATTERNS.orderNumbers) {
        if (pattern.test(order.orderNumber)) {
          issues.push(`Dummy order number pattern: ${order.orderNumber}`)
          isDummy = true
          break
        }
      }

      // Check notes for dummy patterns
      if (order.notes) {
        for (const pattern of DUMMY_PATTERNS.notes) {
          if (pattern.test(order.notes)) {
            issues.push(`Dummy notes pattern: ${order.notes}`)
            isDummy = true
            break
          }
        }
      }

      // Check user email patterns
      if (order.user?.email) {
        for (const pattern of DUMMY_PATTERNS.userEmails) {
          if (pattern.test(order.user.email)) {
            issues.push(`Dummy user email: ${order.user.email}`)
            isDummy = true
            break
          }
        }
      }

      // Check address patterns
      if (order.address) {
        const addressText = `${order.address.firstName} ${order.address.lastName} ${order.address.address} ${order.address.city}`.toLowerCase()
        for (const pattern of DUMMY_PATTERNS.addressPatterns) {
          if (pattern.test(addressText)) {
            issues.push(`Dummy address pattern: ${addressText}`)
            isDummy = true
            break
          }
        }
      }

      // Check for invalid order values
      if (order.total < VALIDATION_CRITERIA.minOrderValue) {
        issues.push(`Invalid order value: ${order.total}`)
        isSuspicious = true
      }

      // Check for invalid payment methods
      if (!VALIDATION_CRITERIA.validPaymentMethods.includes(order.paymentMethod)) {
        issues.push(`Invalid payment method: ${order.paymentMethod}`)
        isSuspicious = true
      }

      // Check for inactive users
      if (!order.user?.isActive) {
        issues.push(`Inactive user: ${order.user?.email}`)
        isSuspicious = true
      }

      // Check for orders without items
      if (!order.orderItems || order.orderItems.length === 0) {
        issues.push('Order has no items')
        isDummy = true
      }

      // Check for orders with invalid products
      const invalidProducts = order.orderItems?.filter(item => 
        !item.product || item.product.sku?.includes('DEMO') || item.product.sku?.includes('TEST')
      ) || []
      
      if (invalidProducts.length > 0) {
        issues.push(`Invalid/demo products: ${invalidProducts.map(p => p.product?.sku || 'unknown').join(', ')}`)
        isDummy = true
      }

      // Categorize order
      const orderSummary = {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        userEmail: order.user?.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        itemCount: order.orderItems?.length || 0,
        issues
      }

      if (isDummy) {
        auditResults.toDelete.push(orderSummary)
      } else if (isSuspicious) {
        auditResults.suspicious.push(orderSummary)
      } else {
        auditResults.legitimate.push(orderSummary)
      }
    }

    // Display audit results
    console.log('\n📋 AUDIT RESULTS:')
    console.log(`✅ Legitimate orders: ${auditResults.legitimate.length}`)
    console.log(`⚠️  Suspicious orders: ${auditResults.suspicious.length}`)
    console.log(`❌ Orders to delete: ${auditResults.toDelete.length}`)

    if (auditResults.toDelete.length > 0) {
      console.log('\n🗑️  ORDERS TO DELETE:')
      auditResults.toDelete.forEach(order => {
        console.log(`- ${order.orderNumber} (${order.userEmail}) - Issues: ${order.issues.join(', ')}`)
      })
    }

    if (auditResults.suspicious.length > 0) {
      console.log('\n⚠️  SUSPICIOUS ORDERS (Review manually):')
      auditResults.suspicious.forEach(order => {
        console.log(`- ${order.orderNumber} (${order.userEmail}) - Issues: ${order.issues.join(', ')}`)
      })
    }

    return auditResults

  } catch (error) {
    console.error('❌ Error during audit:', error)
    throw error
  }
}

async function cleanupDummyOrders(auditResults, dryRun = true) {
  if (auditResults.toDelete.length === 0) {
    console.log('\n✅ No dummy orders found to delete.')
    return { deleted: 0, errors: [] }
  }

  console.log(`\n🧹 ${dryRun ? 'DRY RUN - ' : ''}Cleaning up ${auditResults.toDelete.length} dummy orders...`)
  
  const results = {
    deleted: 0,
    errors: []
  }

  for (const order of auditResults.toDelete) {
    try {
      if (!dryRun) {
        // Delete order items first (due to foreign key constraints)
        await prisma.orderItem.deleteMany({
          where: { orderId: order.id }
        })

        // Delete the order
        await prisma.order.delete({
          where: { id: order.id }
        })
      }

      console.log(`${dryRun ? '[DRY RUN] ' : ''}✅ Deleted order: ${order.orderNumber}`)
      results.deleted++

    } catch (error) {
      const errorMsg = `Failed to delete order ${order.orderNumber}: ${error.message}`
      console.error(`❌ ${errorMsg}`)
      results.errors.push(errorMsg)
    }
  }

  return results
}

async function logCleanupResults(auditResults, cleanupResults, dryRun) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    dryRun,
    totalOrdersAudited: auditResults.legitimate.length + auditResults.suspicious.length + auditResults.toDelete.length,
    legitimateOrders: auditResults.legitimate.length,
    suspiciousOrders: auditResults.suspicious.length,
    dummyOrdersFound: auditResults.toDelete.length,
    ordersDeleted: cleanupResults.deleted,
    errors: cleanupResults.errors,
    deletedOrders: auditResults.toDelete.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      userEmail: o.userEmail,
      issues: o.issues
    }))
  }

  console.log('\n📝 CLEANUP LOG:')
  console.log(JSON.stringify(logEntry, null, 2))

  return logEntry
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--execute')
  
  console.log('🚀 Order Audit and Cleanup Tool')
  console.log('================================\n')
  
  if (dryRun) {
    console.log('ℹ️  Running in DRY RUN mode. Use --execute to perform actual cleanup.\n')
  }

  try {
    // Step 1: Audit all orders
    const auditResults = await auditOrders()

    // Step 2: Cleanup dummy orders
    const cleanupResults = await cleanupDummyOrders(auditResults, dryRun)

    // Step 3: Log results
    await logCleanupResults(auditResults, cleanupResults, dryRun)

    console.log('\n✅ Audit and cleanup completed successfully!')
    
    if (dryRun && auditResults.toDelete.length > 0) {
      console.log('\n💡 To execute the cleanup, run: node scripts/audit-and-cleanup-orders.js --execute')
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { auditOrders, cleanupDummyOrders, logCleanupResults }