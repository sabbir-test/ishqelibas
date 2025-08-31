#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getAllMeasurementFields() {
  console.log('🔍 ANALYZING MEASUREMENT TABLE STRUCTURE')
  console.log('=======================================\n')

  try {
    // Get a sample measurement record to see all fields
    const sampleMeasurement = await prisma.measurement.findFirst()
    
    if (!sampleMeasurement) {
      console.log('❌ No measurement records found')
      return
    }

    console.log('📊 Complete measurement record structure:')
    console.log(JSON.stringify(sampleMeasurement, null, 2))

    // Extract all measurement fields (excluding metadata)
    const excludeFields = ['id', 'customOrderId', 'userId', 'createdAt', 'updatedAt']
    const measurementFields = Object.keys(sampleMeasurement).filter(key => !excludeFields.includes(key))

    console.log('\n📋 All measurement fields:')
    measurementFields.forEach((field, index) => {
      const value = sampleMeasurement[field]
      console.log(`${index + 1}. ${field}: ${value} (${typeof value})`)
    })

    // Create field mapping for display
    const fieldMapping = {
      blouseBackLength: 'Blouse Back Length',
      fullShoulder: 'Full Shoulder',
      shoulderStrap: 'Shoulder Strap',
      backNeckDepth: 'Back Neck Depth',
      frontNeckDepth: 'Front Neck Depth',
      shoulderToApex: 'Shoulder to Apex',
      frontLength: 'Front Length',
      chest: 'Chest',
      waist: 'Waist',
      sleeveLength: 'Sleeve Length',
      armRound: 'Arm Round',
      sleeveRound: 'Sleeve Round',
      armHole: 'Arm Hole',
      notes: 'Notes'
    }

    console.log('\n🏷️ Field display mapping:')
    measurementFields.forEach(field => {
      const displayName = fieldMapping[field] || field
      console.log(`${field} → "${displayName}"`)
    })

    return {
      measurementFields,
      fieldMapping,
      sampleData: sampleMeasurement
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  getAllMeasurementFields()
}

module.exports = { getAllMeasurementFields }