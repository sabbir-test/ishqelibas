#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixTestUser() {
  try {
    console.log('🔧 Fixing test user password...\n')
    
    // Update test user with correct password
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const updatedUser = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: {
        password: hashedPassword,
        isActive: true
      }
    })
    
    console.log('✅ Test user password updated')
    console.log('📧 Email: test@example.com')
    console.log('🔑 Password: test123')
    
    // Test the password
    const testPassword = await bcrypt.compare('test123', updatedUser.password)
    console.log(`🧪 Password test: ${testPassword ? 'PASSED' : 'FAILED'}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixTestUser()