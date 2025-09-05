#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCompleteMeasurementDisplay() {
  console.log('🧪 TESTING COMPLETE MEASUREMENT DISPLAY')
  console.log('======================================\n')

  try {
    // 1. Get all measurement fields from database
    console.log('1️⃣ Analyzing measurement table structure...')
    
    const sampleMeasurement = await prisma.measurement.findFirst()
    if (!sampleMeasurement) {
      console.log('❌ No measurement records found')
      return
    }

    // Extract measurement fields (excluding metadata)
    const excludeFields = ['id', 'customOrderId', 'userId', 'createdAt', 'updatedAt']
    const allMeasurementFields = Object.keys(sampleMeasurement).filter(key => !excludeFields.includes(key))
    
    console.log(`📊 Found ${allMeasurementFields.length} measurement fields:`)
    allMeasurementFields.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`)
    })

    // 2. Test frontend field mapping
    console.log('\n2️⃣ Testing frontend field mapping...')
    
    const frontendFieldMapping = {
      chest: 'Chest',
      waist: 'Waist',
      blouseBackLength: 'Blouse Back Length',
      fullShoulder: 'Full Shoulder',
      shoulderStrap: 'Shoulder Strap',
      backNeckDepth: 'Back Neck Depth',
      frontNeckDepth: 'Front Neck Depth',
      shoulderToApex: 'Shoulder to Apex',
      frontLength: 'Front Length',
      sleeveLength: 'Sleeve Length',
      armRound: 'Arm Round',
      sleeveRound: 'Sleeve Round',
      armHole: 'Arm Hole'
    }

    const mappedFields = Object.keys(frontendFieldMapping)
    const unmappedFields = allMeasurementFields.filter(field => 
      field !== 'notes' && !mappedFields.includes(field)
    )

    console.log(`✅ Mapped fields: ${mappedFields.length}`)
    console.log(`⚠️ Unmapped fields: ${unmappedFields.length}`)
    
    if (unmappedFields.length > 0) {
      console.log('   Missing from frontend mapping:')
      unmappedFields.forEach(field => console.log(`   - ${field}`))
    }

    // 3. Test with actual measurement data
    console.log('\n3️⃣ Testing with actual measurement data...')
    
    const measurements = await prisma.measurement.findMany({
      include: {
        user: { select: { email: true } }
      }
    })

    measurements.forEach((measurement, index) => {
      console.log(`${index + 1}. User: ${measurement.user.email}`)
      
      // Test which fields have values
      const fieldsWithValues = []
      const fieldsWithNullValues = []
      
      mappedFields.forEach(field => {
        const value = measurement[field]
        if (value !== null && value !== undefined) {
          fieldsWithValues.push(`${frontendFieldMapping[field]}: ${value}"`)
        } else {
          fieldsWithNullValues.push(frontendFieldMapping[field])
        }
      })
      
      console.log(`   ✅ Fields with values (${fieldsWithValues.length}):`)
      fieldsWithValues.forEach(field => console.log(`      - ${field}`))
      
      if (fieldsWithNullValues.length > 0) {
        console.log(`   ⚪ Fields with null values (${fieldsWithNullValues.length}):`)
        fieldsWithNullValues.forEach(field => console.log(`      - ${field}`))
      }
      
      if (measurement.notes) {
        console.log(`   📝 Notes: "${measurement.notes}"`)
      }
      console.log('')
    })

    // 4. Test display logic
    console.log('4️⃣ Testing display logic...')
    
    const testMeasurement = measurements[0]
    if (testMeasurement) {
      console.log('Simulating frontend display for sample measurement:')
      
      Object.entries(frontendFieldMapping).forEach(([field, label]) => {
        const value = testMeasurement[field]
        if (value !== null && value !== undefined) {
          console.log(`   ${label}: ${value}"`)
        }
      })
      
      if (testMeasurement.notes) {
        console.log(`   Notes: ${testMeasurement.notes}`)
      }
      
      console.log(`   Last updated: ${new Date(testMeasurement.updatedAt).toLocaleDateString()}`)
    }

    // 5. Test orders with and without measurements
    console.log('\n5️⃣ Testing orders with and without measurements...')
    
    const customOrders = await prisma.customOrder.findMany({
      include: {
        user: { select: { id: true, email: true } }
      }
    })

    for (const order of customOrders) {
      const userMeasurements = await prisma.measurement.findFirst({
        where: { userId: order.userId },
        orderBy: { createdAt: 'desc' }
      })

      console.log(`Order ${order.id.slice(-6)} (${order.user.email}):`)
      if (userMeasurements) {
        const nonNullFields = Object.entries(frontendFieldMapping).filter(([field]) => 
          userMeasurements[field] !== null && userMeasurements[field] !== undefined
        ).length
        console.log(`   ✅ Will display ${nonNullFields} measurement fields`)
      } else {
        console.log(`   ⚠️ Will show "Measurement not updated in DB, it is pending"`)
      }
    }

    // 6. Summary
    console.log('\n📋 SUMMARY')
    console.log('==========')
    
    const results = {
      totalMeasurementFields: allMeasurementFields.length,
      mappedFields: mappedFields.length,
      unmappedFields: unmappedFields.length,
      measurementRecords: measurements.length,
      allFieldsCovered: unmappedFields.length === 0
    }

    console.log(`Total measurement fields in DB: ${results.totalMeasurementFields}`)
    console.log(`Fields mapped in frontend: ${results.mappedFields}`)
    console.log(`Unmapped fields: ${results.unmappedFields}`)
    console.log(`Measurement records: ${results.measurementRecords}`)
    
    if (results.allFieldsCovered) {
      console.log('✅ All measurement fields are covered in the display')
    } else {
      console.log('⚠️ Some measurement fields are not mapped in frontend')
    }

    console.log('\n🎯 EXPECTED ADMIN EXPERIENCE:')
    console.log('- All available measurement fields displayed dynamically')
    console.log('- Only fields with values are shown (null values hidden)')
    console.log('- Consistent field names and formatting')
    console.log('- Notes and metadata included when available')
    console.log('- Clear pending status for orders without measurements')

    return results

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testCompleteMeasurementDisplay()
}

module.exports = { testCompleteMeasurementDisplay }