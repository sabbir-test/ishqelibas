#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    console.log('Creating demo user...')
    
    const hashedPassword = await bcrypt.hash('demo123', 10)
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {
        password: hashedPassword,
        isActive: true
      },
      create: {
        email: 'demo@example.com',
        name: 'Demo User',
        password: hashedPassword,
        role: 'USER',
        isActive: true
      }
    })
    
    console.log('✅ Demo user created/updated:', demoUser.email)
    console.log('📧 Email: demo@example.com')
    console.log('🔑 Password: demo123')
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()