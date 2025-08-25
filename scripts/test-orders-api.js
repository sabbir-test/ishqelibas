const http = require('http')

// Test the orders API for demo user
const userId = 'cmeohtqkb0000ozaxu2e7eor3' // Demo user ID from previous check
const apiUrl = `http://localhost:3000/api/orders?userId=${userId}`

console.log('🔍 Testing orders API...')
console.log(`URL: ${apiUrl}`)

const req = http.request(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token' // Mock token
  }
}, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      console.log(`\n📡 Response Status: ${res.statusCode}`)
      console.log(`\n📋 Response Body:`)
      console.log(JSON.stringify(JSON.parse(data), null, 2))
    } catch (error) {
      console.log(`\n❌ Error parsing response:`, error)
      console.log(`\n📄 Raw Response:`)
      console.log(data)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Request failed:', error)
})

req.end()