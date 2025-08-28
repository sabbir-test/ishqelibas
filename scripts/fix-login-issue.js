#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function fixLoginIssue() {
  try {
    console.log('🔧 Fixing login issue...\n')
    
    // Recreate users with fresh passwords
    const adminPassword = await bcrypt.hash('admin123', 10)
    const demoPassword = await bcrypt.hash('demo123', 10)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: adminPassword,
        isActive: true,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    const demo = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {
        password: demoPassword,
        isActive: true,
        role: 'USER'
      },
      create: {
        email: 'demo@example.com',
        name: 'Demo Customer',
        password: demoPassword,
        role: 'USER',
        isActive: true
      }
    })
    
    console.log('✅ Users recreated:')
    console.log(`Admin: ${admin.email} / admin123`)
    console.log(`Demo: ${demo.email} / demo123\n`)
    
    // Test password verification
    const adminTest = await bcrypt.compare('admin123', admin.password)
    const demoTest = await bcrypt.compare('demo123', demo.password)
    
    console.log(`Admin password test: ${adminTest ? '✅' : '❌'}`)
    console.log(`Demo password test: ${demoTest ? '✅' : '❌'}\n`)
    
    // Test JWT generation
    const JWT_SECRET = 'your-jwt-secret-key-here-demo-app-2024'
    
    try {
      const adminToken = jwt.sign(
        { userId: admin.id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      console.log('✅ Admin JWT generation: SUCCESS')
    } catch (e) {
      console.log('❌ Admin JWT generation: FAILED')
    }
    
    try {
      const demoToken = jwt.sign(
        { userId: demo.id, email: demo.email, role: demo.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      console.log('✅ Demo JWT generation: SUCCESS')
    } catch (e) {
      console.log('❌ Demo JWT generation: FAILED')
    }
    
    console.log('\n🎯 Login should now work with:')
    console.log('Admin: admin@example.com / admin123')
    console.log('Demo: demo@example.com / demo123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixLoginIssue()