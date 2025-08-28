#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@ishqelibas.com' },
      update: { password: hashedPassword, isActive: true },
      create: {
        email: 'admin@ishqelibas.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log('✅ Admin user fixed:')
    console.log(`Email: ${admin.email}`)
    console.log(`Password: admin123`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminUser()