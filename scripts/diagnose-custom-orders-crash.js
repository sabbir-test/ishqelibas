#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnoseCustomOrdersCrash() {
  console.log('🔍 DIAGNOSING CUSTOM ORDERS CRASH')
  console.log('=================================\n')

  try {
    // Get all custom orders to check for problematic data
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

    console.log(`📊 Found ${customOrders.length} custom orders\n`)

    // Check each order for potential issues
    const issues = []

    customOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`)
      console.log(`   User: ${order.user?.name || 'NULL'} (${order.user?.email || 'NULL'})`)
      console.log(`   Measurements: ${order.oldMeasurements ? order.oldMeasurements.substring(0, 50) + '...' : 'NULL'}`)

      // Check for problematic measurements JSON
      if (order.oldMeasurements) {
        try {
          JSON.parse(order.oldMeasurements)
          console.log(`   ✅ Measurements JSON valid`)
        } catch (error) {
          console.log(`   ❌ Measurements JSON INVALID: ${error.message}`)
          issues.push({
            orderId: order.id,
            issue: 'Invalid measurements JSON',
            value: order.oldMeasurements
          })
        }
      } else {
        console.log(`   ⚠️ Measurements is NULL`)
        issues.push({
          orderId: order.id,
          issue: 'NULL measurements',
          value: null
        })
      }

      // Check for missing user data
      if (!order.user) {
        console.log(`   ❌ User data is NULL`)
        issues.push({
          orderId: order.id,
          issue: 'NULL user data',
          value: null
        })
      }

      console.log('')
    })

    // Summary
    console.log('📋 DIAGNOSIS SUMMARY')
    console.log('===================')
    
    if (issues.length === 0) {
      console.log('✅ No data issues found')
    } else {
      console.log(`❌ Found ${issues.length} issues:`)
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. Order ${issue.orderId}: ${issue.issue}`)
        if (issue.value) {
          console.log(`      Value: ${issue.value}`)
        }
      })
    }

    // Test the specific problematic code
    console.log('\n🧪 Testing problematic frontend code...')
    
    customOrders.forEach((order, index) => {
      try {
        // This is the line that crashes in the frontend
        const measurements = JSON.stringify(JSON.parse(order.oldMeasurements), null, 2)
        console.log(`${index + 1}. Order ${order.id.slice(-6)}: ✅ Measurements parsing OK`)
      } catch (error) {
        console.log(`${index + 1}. Order ${order.id.slice(-6)}: ❌ CRASH - ${error.message}`)
        issues.push({
          orderId: order.id,
          issue: 'Frontend parsing crash',
          error: error.message
        })
      }
    })

    return {
      totalOrders: customOrders.length,
      issues,
      crashingOrders: issues.filter(i => i.issue.includes('crash') || i.issue.includes('Invalid'))
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  diagnoseCustomOrdersCrash()
}

module.exports = { diagnoseCustomOrdersCrash }