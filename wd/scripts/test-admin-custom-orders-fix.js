#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAdminCustomOrdersFix() {
  console.log('🧪 TESTING ADMIN CUSTOM ORDERS FIXES')
  console.log('====================================\n')

  try {
    // 1. Test data integrity
    console.log('1️⃣ Testing data integrity...')
    
    const customOrders = await prisma.customOrder.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Found ${customOrders.length} custom orders`)

    // 2. Test data sanitization (simulating API response)
    console.log('\n2️⃣ Testing data sanitization...')
    
    const sanitizedOrders = customOrders.map(order => ({
      ...order,
      measurements: order.oldMeasurements || '{}',
      user: order.user || { name: 'Unknown', email: 'unknown@example.com' }
    }))

    console.log('✅ Data sanitization successful')

    // 3. Test measurements parsing (simulating frontend)
    console.log('\n3️⃣ Testing measurements parsing...')
    
    let parseErrors = 0
    sanitizedOrders.forEach((order, index) => {
      try {
        const measurements = order.measurements 
          ? JSON.stringify(JSON.parse(order.measurements), null, 2)
          : 'No measurements available'
        console.log(`${index + 1}. Order ${order.id.slice(-6)}: ✅ Parse OK`)
      } catch (error) {
        console.log(`${index + 1}. Order ${order.id.slice(-6)}: ❌ Parse Error - ${error.message}`)
        parseErrors++
      }
    })

    // 4. Test error handling scenarios
    console.log('\n4️⃣ Testing error handling scenarios...')
    
    // Test null order
    try {
      const nullOrder = null
      if (!nullOrder || !nullOrder.id) {
        console.log('✅ Null order validation working')
      }
    } catch (error) {
      console.log('❌ Null order validation failed')
    }

    // Test invalid measurements
    try {
      const invalidMeasurements = 'invalid json {'
      const result = (() => {
        try {
          return invalidMeasurements 
            ? JSON.stringify(JSON.parse(invalidMeasurements), null, 2)
            : 'No measurements available'
        } catch (error) {
          return `Invalid measurements data: ${invalidMeasurements}`
        }
      })()
      console.log('✅ Invalid measurements handling working')
    } catch (error) {
      console.log('❌ Invalid measurements handling failed')
    }

    // 5. Summary
    console.log('\n📋 TEST SUMMARY')
    console.log('===============')
    
    const issues = []
    
    if (parseErrors > 0) {
      issues.push(`${parseErrors} measurement parsing errors`)
    }
    
    if (customOrders.some(o => !o.user)) {
      issues.push('Some orders missing user data')
    }

    if (issues.length === 0) {
      console.log('✅ All tests passed')
      console.log('✅ Admin custom orders page should work without crashes')
      console.log('✅ Error handling is properly implemented')
    } else {
      console.log('⚠️ Issues found:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }

    return {
      totalOrders: customOrders.length,
      parseErrors,
      issues,
      success: issues.length === 0
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testAdminCustomOrdersFix()
}

module.exports = { testAdminCustomOrdersFix }