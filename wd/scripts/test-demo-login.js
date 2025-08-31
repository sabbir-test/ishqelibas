#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testDemoLogin() {
  try {
    console.log('🔍 Testing demo user login...\n')
    
    // Check if demo user exists
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (!demoUser) {
      console.log('❌ Demo user not found')
      return
    }
    
    console.log('✅ Demo user found:')
    console.log(`   Email: ${demoUser.email}`)
    console.log(`   Name: ${demoUser.name}`)
    console.log(`   Active: ${demoUser.isActive}`)
    console.log(`   Role: ${demoUser.role}`)
    console.log()
    
    // Test password verification
    const testPassword = 'demo123'
    const isValidPassword = await bcrypt.compare(testPassword, demoUser.password)
    
    console.log(`🔑 Password test for "${testPassword}": ${isValidPassword ? '✅ VALID' : '❌ INVALID'}`)
    
    if (!isValidPassword) {
      console.log('🔧 Fixing password...')
      const newHashedPassword = await bcrypt.hash('demo123', 10)
      
      await prisma.user.update({
        where: { email: 'demo@example.com' },
        data: { password: newHashedPassword }
      })
      
      console.log('✅ Password updated successfully')
    }
    
    // Test login API simulation
    console.log('\n🧪 Simulating login API call...')
    
    const { authenticateUser } = require('../src/lib/auth.ts')
    
    try {
      const result = await authenticateUser('demo@example.com', 'demo123')
      console.log('✅ Login API test: SUCCESS')
      console.log(`   User ID: ${result.user.id}`)
      console.log(`   Token generated: ${result.token ? 'YES' : 'NO'}`)
    } catch (error) {
      console.log('❌ Login API test: FAILED')
      console.log(`   Error: ${error.message}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDemoLogin()