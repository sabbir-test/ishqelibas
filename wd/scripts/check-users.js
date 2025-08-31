#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany()
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Active: ${user.isActive}`)
    })
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()