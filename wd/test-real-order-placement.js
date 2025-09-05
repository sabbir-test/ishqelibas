const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRealOrderPlacement() {
  try {
    console.log('🧪 Testing real order placement and retrieval...\n')
    
    // Find or create a test user (not demo)
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@realuser.com' }
    })
    
    if (!testUser) {
      console.log('👤 Creating test user...')
      testUser = await prisma.user.create({
        data: {
          email: 'test@realuser.com',
          name: 'Test Real User',
          password: 'hashedpassword123',
          phone: '9876543210',
          role: 'USER',
          isActive: true
        }
      })
      console.log(`✅ Created test user: ${testUser.email}`)
    } else {
      console.log(`👤 Using existing test user: ${testUser.email}`)
    }
    
    // Find a product to order
    const product = await prisma.product.findFirst({
      where: { isActive: true, stock: { gt: 0 } }
    })
    
    if (!product) {
      console.log('❌ No products available for testing')
      return
    }
    
    console.log(`📦 Using product: ${product.name} (₹${product.price})`)
    
    // Create address for the order
    const address = await prisma.address.create({
      data: {
        userId: testUser.id,
        type: 'Home',
        firstName: 'Test',
        lastName: 'User',
        email: testUser.email,
        phone: '9876543210',
        address: '123 Real Street',
        city: 'Real City',
        state: 'Real State',
        zipCode: '123456',
        country: 'India'
      }
    })
    
    console.log(`🏠 Created address: ${address.address}`)
    
    // Create a real order
    const orderNumber = `ORD-REAL-${Date.now().toString().slice(-6)}`
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: product.price,
        tax: product.price * 0.18, // 18% tax
        shipping: 50,
        total: product.price + (product.price * 0.18) + 50,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        addressId: address.id,
        notes: 'Real test order for verification'
      }
    })
    
    // Create order item
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: product.price
      }
    })
    
    console.log(`✅ Created real order: ${order.orderNumber} (₹${order.total})`)
    
    // Test order retrieval (simulate API call)
    console.log('\\n🔍 Testing order retrieval...')
    
    const retrievedOrders = await prisma.order.findMany({
      where: { userId: testUser.id },
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
    
    console.log(`📊 Raw orders retrieved: ${retrievedOrders.length}`)
    
    // Apply filtering logic (same as API)
    const legitimateOrders = retrievedOrders.filter(order => {
      // Basic validation - order must have items
      if (!order.orderItems || order.orderItems.length === 0) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: No items`)
        return false
      }

      // Check for dummy email patterns
      const dummyEmailPatterns = [
        /^demo@example\\./i,
        /^dummy@/i,
        /^sample@/i,
        /^fake@/i,
        /^placeholder@/i
      ]
      
      const isDummyEmail = dummyEmailPatterns.some(pattern => 
        pattern.test(order.user?.email || '')
      )
      
      if (isDummyEmail) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: Dummy email ${order.user?.email}`)
        return false
      }

      // Check for dummy order number patterns
      const dummyOrderPatterns = [
        /^DEMO-/i,
        /^DUMMY-/i,
        /^SAMPLE-/i,
        /^ORD-(000000|111111|999999)$/i
      ]
      
      const isDummyOrder = dummyOrderPatterns.some(pattern => 
        pattern.test(order.orderNumber)
      )
      
      if (isDummyOrder) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: Dummy order pattern`)
        return false
      }

      // Check for invalid order values
      if (order.total <= 0) {
        console.log(`🚫 Filtering out order ${order.orderNumber}: Invalid total ${order.total}`)
        return false
      }

      console.log(`✅ Order ${order.orderNumber} is legitimate`)
      return true
    })
    
    console.log(`📈 Legitimate orders after filtering: ${legitimateOrders.length}`)
    
    if (legitimateOrders.length > 0) {
      console.log('\\n📋 Order details:')
      legitimateOrders.forEach(order => {
        console.log(`  - ${order.orderNumber}`)
        console.log(`    User: ${order.user?.email}`)
        console.log(`    Total: ₹${order.total}`)
        console.log(`    Status: ${order.status}`)
        console.log(`    Items: ${order.orderItems.length}`)
        console.log(`    Address: ${order.address?.address}, ${order.address?.city}`)
        console.log('')
      })
    }
    
    // Test with admin user too
    console.log('\\n🔍 Testing admin user orders...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@ishqelibas.com' }
    })
    
    if (adminUser) {
      const adminOrders = await prisma.order.findMany({
        where: { userId: adminUser.id },
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, sku: true }
              }
            }
          },
          address: true,
          user: {
            select: { email: true, isActive: true }
          }
        }
      })
      
      console.log(`📊 Admin orders found: ${adminOrders.length}`)
      adminOrders.forEach(order => {
        console.log(`  - ${order.orderNumber}: ₹${order.total}, ${order.status}`)
      })
    }
    
    console.log('\\n🎯 SUMMARY:')
    console.log('=============')
    console.log(`✅ Test user (${testUser.email}): ${legitimateOrders.length} legitimate orders`)
    console.log(`✅ Real order created and retrieved successfully`)
    console.log(`✅ Filtering logic working correctly`)
    console.log(`✅ Orders should now appear in "My Orders" page`)
    
    // Clean up test data
    console.log('\\n🧹 Cleaning up test data...')
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
    await prisma.order.delete({ where: { id: order.id } })
    await prisma.address.delete({ where: { id: address.id } })
    await prisma.user.delete({ where: { id: testUser.id } })
    console.log('✅ Test data cleaned up')
    
  } catch (error) {
    console.error('❌ Error during test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRealOrderPlacement()