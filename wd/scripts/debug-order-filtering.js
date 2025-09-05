#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Debug script to test order filtering logic
 */

async function debugOrderFiltering() {
  console.log('🐛 DEBUGGING ORDER FILTERING LOGIC')
  console.log('==================================\n')

  try {
    // Create test scenarios
    const testOrders = [
      {
        id: 'test1',
        orderNumber: 'ORD-123456',
        total: 100,
        notes: 'Regular order',
        orderItems: [{ product: { id: 'prod1', sku: 'SHIRT-001' } }],
        user: { email: 'customer@gmail.com', isActive: true }
      },
      {
        id: 'test2', 
        orderNumber: 'TEST-123456',
        total: 100,
        notes: 'Test order for investigation',
        orderItems: [{ product: { id: 'prod2', sku: 'TEST-PRODUCT-001' } }],
        user: { email: 'test-orders@example.com', isActive: true }
      },
      {
        id: 'test3',
        orderNumber: 'ORD-789012',
        total: 200,
        notes: null,
        orderItems: [{ product: { id: 'prod3', sku: 'BLOUSE-002' } }],
        user: { email: 'user@company.com', isActive: true }
      },
      {
        id: 'test4',
        orderNumber: 'DEMO-456789',
        total: 50,
        notes: 'Demo order for testing',
        orderItems: [{ product: { id: 'prod4', sku: 'DEMO-ITEM' } }],
        user: { email: 'demo@example.com', isActive: true }
      }
    ]

    // Import validation logic
    const { validateOrder, filterLegitimateOrders } = require('../src/lib/order-validation.ts')

    console.log('Testing individual order validation:\n')
    
    testOrders.forEach((order, index) => {
      const validation = validateOrder(order)
      console.log(`Order ${index + 1}: ${order.orderNumber}`)
      console.log(`  Email: ${order.user.email}`)
      console.log(`  SKU: ${order.orderItems[0]?.product?.sku}`)
      console.log(`  Valid: ${validation.isValid ? '✅' : '❌'}`)
      if (!validation.isValid) {
        console.log(`  Issues: ${validation.issues.join(', ')}`)
      }
      console.log()
    })

    // Test filtering
    const filteredOrders = filterLegitimateOrders(testOrders)
    console.log(`Filtering Results:`)
    console.log(`  Input orders: ${testOrders.length}`)
    console.log(`  Output orders: ${filteredOrders.length}`)
    console.log(`  Filtered out: ${testOrders.length - filteredOrders.length}`)
    console.log()

    // Show which orders passed
    console.log('Orders that passed filtering:')
    filteredOrders.forEach(order => {
      console.log(`  ✅ ${order.orderNumber} (${order.user.email})`)
    })

    // Show which orders were filtered out
    const filteredOutOrders = testOrders.filter(order => 
      !filteredOrders.some(filtered => filtered.id === order.id)
    )
    
    if (filteredOutOrders.length > 0) {
      console.log('\nOrders that were filtered out:')
      filteredOutOrders.forEach(order => {
        const validation = validateOrder(order)
        console.log(`  ❌ ${order.orderNumber} (${order.user.email})`)
        console.log(`     Reasons: ${validation.issues.join(', ')}`)
      })
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

if (require.main === module) {
  debugOrderFiltering()
}

module.exports = { debugOrderFiltering }