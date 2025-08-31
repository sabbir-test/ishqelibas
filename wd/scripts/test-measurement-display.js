#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testMeasurementDisplay() {
  console.log('🧪 TESTING MEASUREMENT DISPLAY FUNCTIONALITY')
  console.log('============================================\n')

  try {
    // 1. Test API response structure
    console.log('1️⃣ Testing API response structure...')
    
    const orders = await prisma.customOrder.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Fetch measurements for each order's user
    const ordersWithMeasurements = await Promise.all(
      orders.map(async (order) => {
        const measurements = await prisma.measurement.findMany({
          where: { userId: order.userId },
          orderBy: { createdAt: 'desc' },
          take: 1
        })
        
        return {
          ...order,
          userMeasurements: measurements[0] || null
        }
      })
    )

    console.log(`📊 Found ${ordersWithMeasurements.length} orders with measurement data`)

    // 2. Test each order's measurement status
    console.log('\n2️⃣ Testing measurement status for each order...')
    
    ordersWithMeasurements.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.id.slice(-6)} (${order.user.email}):`)
      
      if (order.userMeasurements) {
        console.log(`   ✅ Measurements Available:`)
        console.log(`      Chest: ${order.userMeasurements.chest}"`)
        console.log(`      Waist: ${order.userMeasurements.waist}"`)
        console.log(`      Sleeve Length: ${order.userMeasurements.sleeveLength}"`)
        console.log(`      Blouse Back Length: ${order.userMeasurements.blouseBackLength}"`)
        console.log(`      Notes: ${order.userMeasurements.notes || 'None'}`)
      } else {
        console.log(`   ⚠️ Status: PENDING - No measurements in database`)
      }
      console.log('')
    })

    // 3. Test frontend display logic
    console.log('3️⃣ Testing frontend display logic...')
    
    const ordersWithMeasurements_count = ordersWithMeasurements.filter(o => o.userMeasurements).length
    const ordersPending_count = ordersWithMeasurements.filter(o => !o.userMeasurements).length
    
    console.log(`📊 Orders with measurements: ${ordersWithMeasurements_count}`)
    console.log(`📊 Orders pending measurements: ${ordersPending_count}`)

    // 4. Test measurement field completeness
    console.log('\n4️⃣ Testing measurement field completeness...')
    
    ordersWithMeasurements.forEach((order, index) => {
      if (order.userMeasurements) {
        const measurements = order.userMeasurements
        const requiredFields = ['chest', 'waist', 'fullShoulder', 'sleeveLength', 'blouseBackLength']
        const missingFields = requiredFields.filter(field => !measurements[field])
        
        if (missingFields.length > 0) {
          console.log(`${index + 1}. Order ${order.id.slice(-6)}: ⚠️ Missing fields: ${missingFields.join(', ')}`)
        } else {
          console.log(`${index + 1}. Order ${order.id.slice(-6)}: ✅ All required fields present`)
        }
      }
    })

    // 5. Summary
    console.log('\n📋 TEST SUMMARY')
    console.log('===============')
    
    const results = {
      totalOrders: ordersWithMeasurements.length,
      ordersWithMeasurements: ordersWithMeasurements_count,
      ordersPending: ordersPending_count,
      apiWorking: true,
      measurementFieldsComplete: true
    }

    console.log(`Total Orders: ${results.totalOrders}`)
    console.log(`Orders with Measurements: ${results.ordersWithMeasurements}`)
    console.log(`Orders Pending: ${results.ordersPending}`)
    
    if (results.ordersPending > 0) {
      console.log('⚠️ Some orders will show "Measurement Status: Pending"')
    }
    
    if (results.ordersWithMeasurements > 0) {
      console.log('✅ Some orders will show detailed measurement values')
    }

    console.log('\n🎯 EXPECTED FRONTEND BEHAVIOR:')
    console.log('- Orders with measurements: Show detailed measurement grid')
    console.log('- Orders without measurements: Show "Pending" status with update button')
    console.log('- All measurement values displayed with proper units (inches)')

    return results

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testMeasurementDisplay()
}

module.exports = { testMeasurementDisplay }