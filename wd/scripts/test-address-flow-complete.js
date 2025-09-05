#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCompleteAddressFlow() {
  console.log('🔍 COMPREHENSIVE ADDRESS FLOW TEST')
  console.log('===================================\n')

  try {
    // 1. Test Database Storage
    console.log('1️⃣ Testing Database Storage...')
    
    const recentOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        user: { select: { email: true } }
      }
    })
    
    if (!recentOrder) {
      console.log('❌ No orders found in database')
      return
    }
    
    console.log(`✅ Latest Order: ${recentOrder.orderNumber}`)
    console.log(`   User: ${recentOrder.user.email}`)
    console.log(`   Address ID: ${recentOrder.addressId}`)
    
    if (recentOrder.address) {
      console.log(`   ✅ Address Data Present:`)
      console.log(`      Name: ${recentOrder.address.firstName} ${recentOrder.address.lastName}`)
      console.log(`      Address: ${recentOrder.address.address}`)
      console.log(`      City: ${recentOrder.address.city}, ${recentOrder.address.state} ${recentOrder.address.zipCode}`)
      console.log(`      Phone: ${recentOrder.address.phone}`)
    } else {
      console.log(`   ❌ No address data linked`)
    }

    // 2. Test API Response Structure
    console.log('\n2️⃣ Testing API Response Structure...')
    
    // Test orders list API
    const ordersListResponse = await prisma.order.findMany({
      take: 1,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            email: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (ordersListResponse.length > 0) {
      const order = ordersListResponse[0]
      console.log(`✅ Orders List API Structure:`)
      console.log(`   Order: ${order.orderNumber}`)
      console.log(`   Address Included: ${!!order.address}`)
      
      if (order.address) {
        console.log(`   Address Fields: firstName, lastName, address, city, state, zipCode, phone`)
      }
    }
    
    // Test individual order API
    const individualOrderResponse = await prisma.order.findFirst({
      where: { id: recentOrder.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true
              }
            }
          }
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
    
    console.log(`✅ Individual Order API Structure:`)
    console.log(`   Order: ${individualOrderResponse.orderNumber}`)
    console.log(`   Address Included: ${!!individualOrderResponse.address}`)

    // 3. Test Frontend Data Transformation
    console.log('\n3️⃣ Testing Frontend Data Transformation...')
    
    if (individualOrderResponse.address) {
      const frontendAddress = {
        firstName: individualOrderResponse.address.firstName || '',
        lastName: individualOrderResponse.address.lastName || '',
        name: `${individualOrderResponse.address.firstName || ''} ${individualOrderResponse.address.lastName || ''}`.trim(),
        phone: individualOrderResponse.address.phone || '',
        address: individualOrderResponse.address.address || '',
        city: individualOrderResponse.address.city || '',
        state: individualOrderResponse.address.state || '',
        zipCode: individualOrderResponse.address.zipCode || '',
        country: individualOrderResponse.address.country || ''
      }
      
      console.log(`✅ Frontend Address Object:`)
      console.log(`   Name: "${frontendAddress.name}"`)
      console.log(`   Address: "${frontendAddress.address}"`)
      console.log(`   City/State: "${frontendAddress.city}, ${frontendAddress.state} ${frontendAddress.zipCode}"`)
      console.log(`   Phone: "${frontendAddress.phone}"`)
      
      // Check for empty fields
      const emptyFields = []
      if (!frontendAddress.name) emptyFields.push('name')
      if (!frontendAddress.address) emptyFields.push('address')
      if (!frontendAddress.city) emptyFields.push('city')
      if (!frontendAddress.state) emptyFields.push('state')
      if (!frontendAddress.phone) emptyFields.push('phone')
      
      if (emptyFields.length > 0) {
        console.log(`   ⚠️ Empty Fields: ${emptyFields.join(', ')}`)
      } else {
        console.log(`   ✅ All required fields populated`)
      }
    } else {
      console.log(`❌ No address data for frontend transformation`)
    }

    // 4. Test Address Display Logic
    console.log('\n4️⃣ Testing Address Display Logic...')
    
    if (individualOrderResponse.address) {
      const addr = individualOrderResponse.address
      
      // Simulate frontend display logic
      const displayName = addr.firstName && addr.lastName 
        ? `${addr.firstName} ${addr.lastName}`.trim()
        : 'N/A'
      
      const displayAddress = addr.address || 'N/A'
      
      const displayLocation = addr.city && addr.state
        ? `${addr.city}, ${addr.state} ${addr.zipCode || ''}`.trim()
        : addr.city || addr.state || 'N/A'
      
      const displayPhone = addr.phone || 'N/A'
      
      console.log(`✅ Display Values:`)
      console.log(`   Name: "${displayName}"`)
      console.log(`   Address: "${displayAddress}"`)
      console.log(`   Location: "${displayLocation}"`)
      console.log(`   Phone: "${displayPhone}"`)
      
      const hasNAValues = [displayName, displayAddress, displayLocation, displayPhone]
        .some(val => val === 'N/A')
      
      if (hasNAValues) {
        console.log(`   ⚠️ Some fields showing "N/A"`)
      } else {
        console.log(`   ✅ All fields have real data`)
      }
    }

    // 5. Summary
    console.log('\n📋 SUMMARY')
    console.log('==========')
    
    const issues = []
    
    if (!recentOrder.address) {
      issues.push('No address linked to order')
    }
    
    if (recentOrder.address) {
      const addr = recentOrder.address
      if (!addr.firstName && !addr.lastName) issues.push('Missing name data')
      if (!addr.address) issues.push('Missing street address')
      if (!addr.city) issues.push('Missing city')
      if (!addr.state) issues.push('Missing state')
      if (!addr.phone) issues.push('Missing phone')
    }
    
    if (issues.length === 0) {
      console.log('✅ Address flow is working correctly')
      console.log('✅ All data properly stored and retrievable')
      console.log('✅ Frontend should display complete addresses')
    } else {
      console.log('⚠️ Issues found:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    }

    return {
      hasOrder: !!recentOrder,
      hasAddress: !!recentOrder?.address,
      addressComplete: recentOrder?.address && 
        recentOrder.address.firstName &&
        recentOrder.address.address &&
        recentOrder.address.city &&
        recentOrder.address.state,
      issues
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testCompleteAddressFlow()
}

module.exports = { testCompleteAddressFlow }