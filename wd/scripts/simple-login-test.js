#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('Testing demo login...')
    
    const user = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    const isValid = await bcrypt.compare('demo123', user.password)
    console.log(`Password valid: ${isValid}`)
    
    if (isValid) {
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        'your-jwt-secret-key-here-demo-app-2024',
        { expiresIn: '7d' }
      )
      console.log('✅ Login would succeed')
      console.log('Token generated:', !!token)
    } else {
      console.log('❌ Login would fail - invalid password')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()