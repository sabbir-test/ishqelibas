#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

async function testAddressAPI() {
  try {
    console.log('🧪 Testing Address API...\n')
    
    // Get a test user
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (!user) {
      console.log('❌ No test user found')
      return
    }
    
    console.log(`👤 Testing with user: ${user.email}`)
    
    // Generate a token for the user
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '7d' })
    
    console.log('🔑 Generated token for API test')
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/addresses', {
      method: 'GET',
      headers: {
        'Cookie': `auth-token=${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📡 API Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Response:', data)
      console.log(`📍 Found ${data.addresses?.length || 0} addresses`)
    } else {
      const errorData = await response.text()
      console.log('❌ API Error:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAddressAPI()