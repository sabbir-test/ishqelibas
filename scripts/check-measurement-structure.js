#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMeasurementStructure() {
  console.log('🔍 CHECKING MEASUREMENT STRUCTURE')
  console.log('=================================\n')

  try {
    // Check if measurements table exists and its structure
    console.log('1️⃣ Checking measurements table...')
    
    const measurements = await prisma.measurement.findMany({
      take: 5,
      include: {
        user: { select: { email: true } }
      }
    }).catch(() => null)

    if (measurements) {
      console.log(`✅ Measurements table exists with ${measurements.length} records`)
      if (measurements.length > 0) {
        console.log('Sample measurement structure:')
        console.log(JSON.stringify(measurements[0], null, 2))
      }
    } else {
      console.log('❌ Measurements table not found or accessible')
    }

    // Check custom orders and their measurement data
    console.log('\n2️⃣ Checking custom orders measurement data...')
    
    const customOrders = await prisma.customOrder.findMany({
      take: 3,
      include: {
        user: { select: { email: true, id: true } }
      }
    })

    console.log(`📊 Found ${customOrders.length} custom orders`)
    
    customOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.id.slice(-6)}:`)
      console.log(`   User: ${order.user.email} (ID: ${order.user.id})`)
      console.log(`   Measurements in order: ${order.oldMeasurements ? 'Present' : 'Missing'}`)
      
      if (order.oldMeasurements) {
        try {
          const parsed = JSON.parse(order.oldMeasurements)
          console.log(`   Fields: ${Object.keys(parsed).join(', ')}`)
        } catch (e) {
          console.log(`   Invalid JSON: ${order.oldMeasurements}`)
        }
      }
    })

    // Check if we can link measurements to custom orders
    console.log('\n3️⃣ Checking measurement-order relationships...')
    
    if (measurements && measurements.length > 0 && customOrders.length > 0) {
      for (const order of customOrders) {
        const userMeasurements = measurements.filter(m => m.userId === order.userId)
        console.log(`Order ${order.id.slice(-6)} - User measurements: ${userMeasurements.length}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkMeasurementStructure()