#!/usr/bin/env node

const http = require('http')

// Test the login API endpoint directly
function testLoginAPI() {
  const postData = JSON.stringify({
    email: 'demo@example.com',
    password: 'demo123'
  })

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }

  console.log('🧪 Testing login API endpoint...')
  console.log('URL: http://localhost:3000/api/auth/login')
  console.log('Payload:', postData)

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`)
    console.log(`Headers:`, res.headers)

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('Response:', data)
      if (res.statusCode === 200) {
        console.log('✅ Login API working correctly')
      } else {
        console.log('❌ Login API failed')
      }
    })
  })

  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message)
    console.log('💡 Make sure the Next.js server is running on port 3000')
  })

  req.write(postData)
  req.end()
}

testLoginAPI()