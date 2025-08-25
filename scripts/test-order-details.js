const http = require('http')

// Test the order details page by simulating the same logic
const orderId = 'cmepasvqs0001ppm9cmfxbcrr' // The old broken order
const userId = 'cmeohtqkb0000ozaxu2e7eor3' // Demo user ID
const apiUrl = `http://localhost:3000/api/orders?userId=${userId}`

console.log('🔍 Testing order details for order ID:', orderId)
console.log(`URL: ${apiUrl}`)

const req = http.request(apiUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token'
  }
}, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      console.log(`\n📡 Response Status: ${res.statusCode}`)
      
      const responseData = JSON.parse(data)
      const userOrder = responseData.orders.find(function(o) { return o.id === orderId })
      
      if (userOrder) {
        console.log(`\n✅ Order found in user's orders:`)
        console.log(`Order ID: ${userOrder.id}`)
        console.log(`Order Number: ${userOrder.orderNumber}`)
        console.log(`Status: ${userOrder.status}`)
        console.log(`Total: ₹${userOrder.total}`)
        console.log(`Order Items: ${userOrder.orderItems.length}`)
        
        if (userOrder.orderItems.length > 0) {
          console.log(`\n📦 Order Items:`)
          userOrder.orderItems.forEach(function(item, index) {
            console.log(`${index + 1}. ${item.product ? item.product.name : 'Unknown Product'}`)
            console.log(`   Quantity: ${item.quantity}`)
            console.log(`   Price: ₹${item.price}`)
            console.log(`   Size: ${item.size || 'N/A'}`)
            console.log(`   Color: ${item.color || 'N/A'}`)
          })
        }
        
        console.log(`\n🎉 Order details page should work correctly for this order!`)
      } else {
        console.log(`\n❌ Order not found in user's orders list`)
        console.log(`Available orders: ${responseData.orders.map(function(o) { return o.orderNumber }).join(', ')}`)
      }
      
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