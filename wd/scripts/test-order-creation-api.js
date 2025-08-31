#!/usr/bin/env node

const http = require('http')

function testOrderCreation() {
  const orderData = {
    userId: 'demo-user-id', // This will need to be actual user ID
    items: [{
      productId: 'custom-blouse',
      quantity: 1,
      finalPrice: 2500,
      size: 'M',
      color: 'Pink',
      customDesign: {
        fabric: { name: 'Silk', color: '#FF6B9D' },
        frontDesign: { name: 'Boat Neck' },
        backDesign: { name: 'Deep Back' },
        measurements: { chest: 36, waist: 32 }
      }
    }],
    shippingInfo: {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      phone: '9876543210',
      address: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    paymentInfo: {
      method: 'COD',
      notes: 'Test order'
    },
    subtotal: 2500,
    tax: 450,
    shipping: 100,
    total: 3050
  }

  const postData = JSON.stringify(orderData)

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  console.log('🧪 Testing order creation API...')

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('Response:', data)
      
      if (res.statusCode === 200) {
        console.log('✅ Order creation API working')
      } else {
        console.log('❌ Order creation failed')
      }
    })
  })

  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message)
    console.log('💡 Make sure Next.js server is running')
  })

  req.write(postData)
  req.end()
}

testOrderCreation()