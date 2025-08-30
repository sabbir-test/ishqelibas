#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyAddressFixes() {
  console.log('✅ VERIFYING ADDRESS FIXES')
  console.log('==========================\n')

  try {
    // Test all recent orders
    const orders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        user: { select: { email: true } }
      }
    })

    console.log(`📊 Testing ${orders.length} recent orders:\n`)

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderNumber} (${order.user.email})`)
      
      if (order.address) {
        // Test Orders List Page Display
        const ordersPageAddress = {
          name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim(),
          phone: order.address.phone || '',
          address: order.address.address || '',
          city: order.address.city || '',
          state: order.address.state || '',
          pincode: order.address.zipCode || ''
        }

        const ordersPageDisplay = ordersPageAddress.address ? 
          `${ordersPageAddress.address}, ` : ''
        const cityStateDisplay = ordersPageAddress.city && ordersPageAddress.state ? 
          `${ordersPageAddress.city}, ${ordersPageAddress.state}` : 
          ordersPageAddress.city || ordersPageAddress.state || 'Address not available'

        console.log(`   📋 Orders List Display: "${cityStateDisplay}"`)

        // Test Order Details Page Display  
        const detailsPageAddress = {
          firstName: order.address.firstName || '',
          lastName: order.address.lastName || '',
          name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim(),
          phone: order.address.phone || '',
          address: order.address.address || '',
          city: order.address.city || '',
          state: order.address.state || '',
          zipCode: order.address.zipCode || '',
          country: order.address.country || ''
        }

        const detailsName = detailsPageAddress.name || 'N/A'
        const detailsAddress = detailsPageAddress.address || 'N/A'
        const detailsLocation = `${detailsPageAddress.city || 'N/A'}, ${detailsPageAddress.state || 'N/A'} ${detailsPageAddress.zipCode || ''}`
        const detailsPhone = detailsPageAddress.phone || 'N/A'

        console.log(`   📄 Details Page Display:`)
        console.log(`      Name: "${detailsName}"`)
        console.log(`      Address: "${detailsAddress}"`)
        console.log(`      Location: "${detailsLocation}"`)
        console.log(`      Phone: "${detailsPhone}"`)

        // Check for N/A values
        const hasNA = [detailsName, detailsAddress, detailsLocation, detailsPhone]
          .some(val => val.includes('N/A'))

        if (hasNA) {
          console.log(`   ⚠️ Some fields showing N/A`)
        } else {
          console.log(`   ✅ All fields populated`)
        }

      } else {
        console.log(`   ❌ No address data`)
      }
      console.log('')
    })

    // Summary
    const ordersWithAddress = orders.filter(o => o.address).length
    const ordersWithCompleteAddress = orders.filter(o => 
      o.address && 
      o.address.firstName && 
      o.address.address && 
      o.address.city && 
      o.address.state
    ).length

    console.log('📋 VERIFICATION SUMMARY')
    console.log('======================')
    console.log(`Total Orders: ${orders.length}`)
    console.log(`Orders with Address: ${ordersWithAddress}`)
    console.log(`Orders with Complete Address: ${ordersWithCompleteAddress}`)

    if (ordersWithCompleteAddress === orders.length) {
      console.log('✅ All orders have complete address data')
      console.log('✅ Address display should work correctly')
    } else {
      console.log('⚠️ Some orders missing address data')
    }

    console.log('\n🎯 EXPECTED RESULTS AFTER FIXES:')
    console.log('- Orders list page will show city, state instead of "Address not available"')
    console.log('- Order details page will show complete address instead of "N/A"')
    console.log('- All address fields will be populated from database')

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAddressFixes()