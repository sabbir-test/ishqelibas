#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUsers() {
  try {
    console.log('Creating users...')
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { password: adminPassword, isActive: true },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 10)
    const demo = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: { password: demoPassword, isActive: true },
      create: {
        email: 'demo@example.com',
        name: 'Demo Customer',
        password: demoPassword,
        role: 'USER',
        isActive: true
      }
    })
    
    console.log('✅ Users created:')
    console.log(`Admin: ${admin.email} / admin123`)
    console.log(`Demo: ${demo.email} / demo123`)
    
    // Test login for both
    const { authenticateUser } = require('../src/lib/auth')
    
    try {
      await authenticateUser('admin@example.com', 'admin123')
      console.log('✅ Admin login test: PASSED')
    } catch (e) {
      console.log('❌ Admin login test: FAILED -', e.message)
    }
    
    try {
      await authenticateUser('demo@example.com', 'demo123')
      console.log('✅ Demo login test: PASSED')
    } catch (e) {
      console.log('❌ Demo login test: FAILED -', e.message)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUsers()