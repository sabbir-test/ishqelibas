#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAddresses() {
  try {
    console.log('🏠 Testing Address Functionality...\n')
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    })
    
    console.log(`📊 Found ${users.length} users:\n`)
    
    for (const user of users) {
      console.log(`👤 User: ${user.name} (${user.email})`)
      
      // Get addresses for this user
      const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { isDefault: 'desc' }
      })
      
      console.log(`   📍 Addresses: ${addresses.length}`)
      
      if (addresses.length > 0) {
        addresses.forEach((addr, index) => {
          console.log(`   ${index + 1}. ${addr.type} - ${addr.firstName} ${addr.lastName}`)
          console.log(`      ${addr.address}, ${addr.city}, ${addr.state} - ${addr.zipCode}`)
          console.log(`      Default: ${addr.isDefault}`)
        })
      } else {
        console.log('   ⚠️  No addresses found')
      }
      console.log('')
    }
    
    // Create test address if no addresses exist
    const totalAddresses = await prisma.address.count()
    if (totalAddresses === 0) {
      console.log('🔧 Creating test addresses...\n')
      
      for (const user of users) {
        const testAddress = await prisma.address.create({
          data: {
            userId: user.id,
            type: 'Home',
            firstName: user.name?.split(' ')[0] || 'Test',
            lastName: user.name?.split(' ')[1] || 'User',
            email: user.email,
            phone: '+91 9876543210',
            address: '123 Test Street, Test Area',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            isDefault: true
          }
        })
        
        console.log(`✅ Created test address for ${user.email}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAddresses()