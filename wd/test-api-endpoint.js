const fetch = require('node-fetch')

async function testCheckoutAPI() {
  console.log('🧪 Testing Checkout API Endpoint...\n')

  try {
    // Test data
    const checkoutData = {
      userId: 'cmezf026d0000lxddd0k96aja', // test@example.com
      items: [
        {
          productId: 'cmf03nyrt0002lxyc2wxvk1rj', // Regular product
          name: 'Test Product',
          quantity: 1,
          finalPrice: 500
        },
        {
          productId: 'custom-blouse',
          name: 'Custom Blouse Design',
          quantity: 1,
          finalPrice: 2500,
          customDesign: {
            fabric: { name: 'Silk', color: '#FF0000' },
            frontDesign: { name: 'Traditional' },
            backDesign: { name: 'Simple' },
            measurements: {
              bust: 36,
              waist: 30,
              hips: 38
            }
          }
        }
      ],
      shippingInfo: {
        firstName: 'API',
        lastName: 'Test',
        email: 'test@example.com',
        phone: '9876543210',
        address: '456 API Test Street',
        city: 'API City',
        state: 'API State',
        zipCode: '54321',
        country: 'India'
      },
      paymentInfo: {
        method: 'cod',
        notes: 'API test order'
      },
      subtotal: 3000,
      tax: 540,
      shipping: 0,
      total: 3540
    }

    console.log('📡 Making API request to /api/orders...')
    console.log('Request data:', {
      userId: checkoutData.userId,
      itemCount: checkoutData.items.length,
      total: checkoutData.total
    })

    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    })

    console.log(`📊 Response status: ${response.status} ${response.statusText}`)

    const responseText = await response.text()
    console.log('📄 Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))

    if (response.ok) {
      const responseData = JSON.parse(responseText)
      console.log('\n✅ API call successful!')
      console.log('Order details:', {
        orderNumber: responseData.order?.orderNumber,
        id: responseData.order?.id,
        total: responseData.order?.total,
        status: responseData.order?.status
      })
    } else {
      console.log('\n❌ API call failed')
      try {
        const errorData = JSON.parse(responseText)
        console.log('Error details:', errorData)
      } catch {
        console.log('Raw error:', responseText)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Only run if server is available
console.log('🔍 Checking if development server is running...')
fetch('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Server is running, proceeding with API test...\n')
    testCheckoutAPI()
  })
  .catch(() => {
    console.log('⚠️ Development server not running. Please start with: npm run dev')
    console.log('Skipping API endpoint test.')
  })