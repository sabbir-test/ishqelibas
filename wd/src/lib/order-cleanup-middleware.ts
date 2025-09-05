/**
 * Order cleanup middleware to automatically remove dummy orders
 */

import { db } from '@/lib/db'
import { auditOrders } from '@/lib/order-validation'

interface CleanupConfig {
  enabled: boolean
  runOnStartup: boolean
  scheduleInterval?: number // in milliseconds
  maxDummyOrdersToDelete: number
}

const DEFAULT_CONFIG: CleanupConfig = {
  enabled: process.env.NODE_ENV === 'production',
  runOnStartup: true,
  scheduleInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxDummyOrdersToDelete: 100
}

let cleanupScheduled = false

/**
 * Performs automatic cleanup of dummy/demo orders
 */
export async function performOrderCleanup(config: Partial<CleanupConfig> = {}): Promise<{
  success: boolean
  deletedCount: number
  errors: string[]
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  if (!finalConfig.enabled) {
    return { success: true, deletedCount: 0, errors: [] }
  }

  try {
    console.log('🧹 Starting automatic order cleanup...')

    // Fetch all orders for audit
    const allOrders = await db.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                sku: true
              }
            }
          }
        },
        user: {
          select: {
            email: true,
            isActive: true
          }
        }
      }
    })

    // Audit orders to identify dummy ones
    const auditResults = auditOrders(allOrders)
    
    if (auditResults.dummy.length === 0) {
      console.log('✅ No dummy orders found during cleanup')
      return { success: true, deletedCount: 0, errors: [] }
    }

    // Limit the number of orders to delete in one batch
    const ordersToDelete = auditResults.dummy.slice(0, finalConfig.maxDummyOrdersToDelete)
    const errors: string[] = []
    let deletedCount = 0

    console.log(`🗑️ Deleting ${ordersToDelete.length} dummy orders...`)

    // Delete dummy orders
    for (const order of ordersToDelete) {
      try {
        // Delete order items first (foreign key constraint)
        await db.orderItem.deleteMany({
          where: { orderId: order.id }
        })

        // Delete the order
        await db.order.delete({
          where: { id: order.id }
        })

        deletedCount++
        console.log(`✅ Deleted dummy order: ${order.orderNumber}`)

      } catch (error) {
        const errorMsg = `Failed to delete order ${order.orderNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    // Log cleanup results
    const logEntry = {
      timestamp: new Date().toISOString(),
      totalOrdersAudited: allOrders.length,
      dummyOrdersFound: auditResults.dummy.length,
      ordersDeleted: deletedCount,
      errors: errors.length,
      remainingDummyOrders: auditResults.dummy.length - deletedCount
    }

    console.log('📊 Cleanup completed:', logEntry)

    return {
      success: errors.length === 0,
      deletedCount,
      errors
    }

  } catch (error) {
    const errorMsg = `Order cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    console.error('❌', errorMsg)
    return {
      success: false,
      deletedCount: 0,
      errors: [errorMsg]
    }
  }
}

/**
 * Schedules periodic order cleanup
 */
export function scheduleOrderCleanup(config: Partial<CleanupConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  if (!finalConfig.enabled || cleanupScheduled || !finalConfig.scheduleInterval) {
    return
  }

  cleanupScheduled = true
  
  console.log(`⏰ Scheduling order cleanup every ${finalConfig.scheduleInterval / (60 * 60 * 1000)} hours`)

  // Run initial cleanup if configured
  if (finalConfig.runOnStartup) {
    setTimeout(() => {
      performOrderCleanup(finalConfig).catch(console.error)
    }, 5000) // Wait 5 seconds after startup
  }

  // Schedule periodic cleanup
  setInterval(() => {
    performOrderCleanup(finalConfig).catch(console.error)
  }, finalConfig.scheduleInterval)
}

/**
 * Initialize order cleanup based on environment configuration
 */
export function initializeOrderCleanup() {
  const config: Partial<CleanupConfig> = {
    enabled: process.env.ORDER_CLEANUP_ENABLED !== 'false',
    runOnStartup: process.env.ORDER_CLEANUP_ON_STARTUP !== 'false',
    scheduleInterval: process.env.ORDER_CLEANUP_INTERVAL 
      ? parseInt(process.env.ORDER_CLEANUP_INTERVAL) 
      : undefined,
    maxDummyOrdersToDelete: process.env.MAX_DUMMY_ORDERS_TO_DELETE 
      ? parseInt(process.env.MAX_DUMMY_ORDERS_TO_DELETE) 
      : undefined
  }

  scheduleOrderCleanup(config)
}