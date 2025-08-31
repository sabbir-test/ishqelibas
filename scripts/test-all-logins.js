#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAllLogins() {
  try {
    console.log('🔍 Testing Login for All Users...\n')
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        password: true
      }
    })
    
    console.log(`📊 Found ${users.length} users in database:\n`)
    
    // Test known credentials
    const testCredentials = [
      { email: 'admin@ishqelibas.com', password: 'admin123' },
      { email: 'test@example.com', password: 'test123' },
      { email: 'demo@example.com', password: 'demo123' },
      { email: 'admin@example.com', password: 'admin123' }
    ]
    
    for (const user of users) {
      console.log(`👤 User: ${user.name} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      
      if (!user.isActive) {
        console.log('   ❌ User is inactive - cannot login\n')
        continue
      }
      
      // Try to find matching test credentials
      const testCred = testCredentials.find(cred => cred.email === user.email)
      
      if (testCred) {
        try {
          const isValid = await bcrypt.compare(testCred.password, user.password)
          if (isValid) {
            console.log(`   ✅ Login test PASSED with password: ${testCred.password}`)
          } else {
            console.log(`   ❌ Login test FAILED with password: ${testCred.password}`)
          }
        } catch (error) {
          console.log(`   ❌ Password comparison error: ${error.message}`)
        }
      } else {
        console.log('   ⚠️  No test credentials found for this user')
      }
      console.log('')
    }
    
    // Test authentication function if available
    console.log('🧪 Testing Authentication Function...\n')
    
    try {
      const { authenticateUser } = require('../src/lib/auth')
      
      for (const cred of testCredentials) {
        const user = users.find(u => u.email === cred.email)
        if (user && user.isActive) {
          try {
            const result = await authenticateUser(cred.email, cred.password)
            console.log(`✅ Auth function test PASSED: ${cred.email}`)
          } catch (error) {
            console.log(`❌ Auth function test FAILED: ${cred.email} - ${error.message}`)
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Could not load auth function:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAllLogins()