#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const db = new PrismaClient()

async function checkImagePaths() {
  console.log('🔍 Checking Blouse Model Image Paths')
  console.log('=' .repeat(50))

  try {
    const models = await db.blouseModel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        image: true
      },
      take: 10
    })

    console.log(`\n📊 Found ${models.length} active blouse models:\n`)

    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`)
      console.log(`   ID: ${model.id}`)
      console.log(`   Image Path: ${model.image || 'NULL'}`)
      
      if (model.image) {
        // Check if file exists
        const possiblePaths = [
          path.join(__dirname, model.image),
          path.join(__dirname, 'public', model.image),
          path.join(__dirname, 'assets', model.image.replace('assets/', '')),
          path.join(__dirname, model.image.startsWith('/') ? model.image.slice(1) : model.image)
        ]
        
        let fileExists = false
        possiblePaths.forEach(fullPath => {
          if (fs.existsSync(fullPath)) {
            console.log(`   ✅ File exists at: ${fullPath}`)
            fileExists = true
          }
        })
        
        if (!fileExists) {
          console.log(`   ❌ File not found in any of these locations:`)
          possiblePaths.forEach(p => console.log(`      - ${p}`))
        }
      }
      console.log('')
    })

    // Check assets directory structure
    console.log('\n📁 Checking assets directory structure:')
    const assetsPath = path.join(__dirname, 'assets')
    if (fs.existsSync(assetsPath)) {
      console.log('   ✅ assets/ directory exists')
      
      const blousePath = path.join(assetsPath, 'blouse')
      if (fs.existsSync(blousePath)) {
        console.log('   ✅ assets/blouse/ directory exists')
        
        const hpcPath = path.join(blousePath, 'hpc')
        if (fs.existsSync(hpcPath)) {
          console.log('   ✅ assets/blouse/hpc/ directory exists')
          const files = fs.readdirSync(hpcPath)
          console.log(`   📄 Files in assets/blouse/hpc/: ${files.join(', ')}`)
        } else {
          console.log('   ❌ assets/blouse/hpc/ directory missing')
        }
      } else {
        console.log('   ❌ assets/blouse/ directory missing')
      }
    } else {
      console.log('   ❌ assets/ directory missing')
    }

    // Check public directory
    console.log('\n📁 Checking public directory structure:')
    const publicPath = path.join(__dirname, 'public')
    if (fs.existsSync(publicPath)) {
      console.log('   ✅ public/ directory exists')
      const publicContents = fs.readdirSync(publicPath)
      console.log(`   📄 Contents: ${publicContents.join(', ')}`)
    } else {
      console.log('   ❌ public/ directory missing')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkImagePaths()