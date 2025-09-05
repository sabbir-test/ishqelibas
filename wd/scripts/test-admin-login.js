#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function testAdminLogin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@ishqelibas.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('User found:', user.email)
    console.log('Password hash:', user.password.substring(0, 20) + '...')
    
    const isValid = await bcrypt.compare('admin123', user.password)
    console.log('Password test:', isValid ? '✅ VALID' : '❌ INVALID')
    
    if (!isValid) {
      console.log('🔧 Updating password...')
      const newHash = await bcrypt.hash('admin123', 10)
      await prisma.user.update({
        where: { email: 'admin@ishqelibas.com' },
        data: { password: newHash }
      })
      console.log('✅ Password updated')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()