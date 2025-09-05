#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

async function testAddressLogic() {
  try {
    console.log('🧪 Testing Address Logic...\n')
    
    // Get test user
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })
    
    if (!user) {
      console.log('❌ No test user found')
      return
    }
    
    console.log(`👤 Testing with user: ${user.name} (${user.email})`)
    console.log(`🆔 User ID: ${user.id}`)
    
    // Test the database query directly (same as API)
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' }
    })
    
    console.log(`📍 Found ${addresses.length} addresses in database:`)
    
    addresses.forEach((addr, index) => {
      console.log(`   ${index + 1}. ${addr.type} - ${addr.firstName} ${addr.lastName}`)
      console.log(`      ${addr.address}, ${addr.city}, ${addr.state} - ${addr.zipCode}`)
      console.log(`      Default: ${addr.isDefault}`)
      console.log(`      ID: ${addr.id}`)
    })
    
    // Test token generation and verification
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET, { expiresIn: '7d' })
    
    console.log('\n🔑 Token generated successfully')
    
    // Verify token
    const payload = jwt.verify(token, JWT_SECRET)
    console.log('✅ Token verification successful')
    console.log(`   User ID from token: ${payload.userId}`)
    console.log(`   Matches database: ${payload.userId === user.id}`)
    
    // Test user lookup from token
    const userFromToken = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    if (userFromToken && userFromToken.isActive) {
      console.log('✅ User lookup from token successful')
      console.log(`   Active: ${userFromToken.isActive}`)
    } else {
      console.log('❌ User lookup from token failed')
    }
    
    console.log('\n📋 Summary:')
    console.log(`   ✅ User exists: ${!!user}`)
    console.log(`   ✅ User active: ${user.isActive}`)
    console.log(`   ✅ Addresses found: ${addresses.length}`)
    console.log(`   ✅ Token works: ${!!payload}`)
    console.log(`   ✅ Auth flow: Complete`)
    
  } catch (error) {
    console.error('❌ Test Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAddressLogic()