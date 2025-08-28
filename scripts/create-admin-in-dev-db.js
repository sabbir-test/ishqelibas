#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createAdminInDevDb() {
  // First, ensure dev.db exists and has schema
  const { execSync } = require('child_process')
  
  try {
    // Set DATABASE_URL to dev.db and push schema
    process.env.DATABASE_URL = 'file:./prisma/dev.db'
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    const prisma = new PrismaClient()
    
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
    
    console.log('✅ Admin created in dev.db:', admin.email)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

createAdminInDevDb()