#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateDemoUser() {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: 'demo@example.com' },
      data: { name: 'Demo Customer' }
    })
    
    console.log('✅ Demo user updated:')
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Name: ${updatedUser.name}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

updateDemoUser()