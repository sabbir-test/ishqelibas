#!/usr/bin/env node

const http = require('http')

function testOrdersAPI() {
  console.log('🧪 Testing Orders API Response...\n')

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'GET',
    headers: {
      'Cookie': 'auth-token=your-token-here' // This would need actual token
    }
  }

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`)
    console.log(`📋 Headers:`, res.headers)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const response = JSON.parse(data)
        console.log('\n📊 API Response Structure:')
        
        if (response.orders && response.orders.length > 0) {
          const order = response.orders[0]
          console.log(`Order ID: ${order.id}`)
          console.log(`Order Number: ${order.orderNumber}`)
          console.log(`Address Included: ${!!order.address}`)
          
          if (order.address) {
            console.log('\n✅ Address Data in API Response:')
            console.log(`   Name: ${order.address.firstName} ${order.address.lastName}`)
            console.log(`   Address: ${order.address.address}`)
            console.log(`   City: ${order.address.city}, ${order.address.state}`)
          } else {
            console.log('\n❌ No address data in API response')
          }
        } else {
          console.log('No orders in response')
        }
      } catch (error) {
        console.log('Response:', data)
      }
    })
  })

  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message)
    console.log('💡 Make sure Next.js server is running and you are authenticated')
  })

  req.end()
}

testOrdersAPI()