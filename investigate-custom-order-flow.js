const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function investigateCustomOrderFlow() {
  try {
    console.log('🔍 INVESTIGATING CUSTOM ORDER FLOW\n');

    // Check 1: Recent custom orders in database
    console.log('📊 STEP 1: Database Custom Orders Check');
    console.log('=' .repeat(50));
    
    const customOrders = await db.customOrder.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Total Custom Orders in DB: ${customOrders.length}`);
    
    if (customOrders.length > 0) {
      console.log('\nRecent Custom Orders:');
      customOrders.slice(0, 5).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.user?.email} - ${order.fabric} (${order.status}) - ${order.createdAt}`);
      });
    }

    // Check 2: Regular orders with custom items
    console.log('\n📦 STEP 2: Regular Orders with Custom Items Check');
    console.log('=' .repeat(50));
    
    const ordersWithCustomItems = await db.order.findMany({
      where: {
        orderItems: {
          some: {
            OR: [
              { productId: 'custom-blouse' },
              { productId: 'custom-salwar-kameez' }
            ]
          }
        }
      },
      include: {
        orderItems: {
          where: {
            OR: [
              { productId: 'custom-blouse' },
              { productId: 'custom-salwar-kameez' }
            ]
          },
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Orders with Custom Items: ${ordersWithCustomItems.length}`);
    
    if (ordersWithCustomItems.length > 0) {
      console.log('\nRecent Orders with Custom Items:');
      ordersWithCustomItems.slice(0, 5).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.user?.email} - Order ${order.orderNumber} (${order.status}) - ${order.createdAt}`);
        order.orderItems.forEach(item => {
          console.log(`    - ${item.productId}: ₹${item.price} x ${item.quantity}`);
        });
      });
    }

    // Check 3: Identify the disconnect
    console.log('\n🔍 STEP 3: Flow Analysis');
    console.log('=' .repeat(50));
    
    console.log('Custom Order Flow Analysis:');
    console.log(`1. CustomOrder table entries: ${customOrders.length}`);
    console.log(`2. Orders with custom items: ${ordersWithCustomItems.length}`);
    
    // Check if custom orders are being created in the wrong table
    if (ordersWithCustomItems.length > 0 && customOrders.length === 0) {
      console.log('\n⚠️ POTENTIAL ISSUE IDENTIFIED:');
      console.log('- Custom orders are being stored in Order table (with custom product IDs)');
      console.log('- But admin dashboard is looking in CustomOrder table');
      console.log('- This explains why orders don\'t appear in admin dashboard');
    } else if (customOrders.length > 0 && ordersWithCustomItems.length === 0) {
      console.log('\n⚠️ POTENTIAL ISSUE IDENTIFIED:');
      console.log('- Custom orders are in CustomOrder table');
      console.log('- But no corresponding Order records with custom items');
      console.log('- May indicate incomplete order creation flow');
    } else if (customOrders.length > 0 && ordersWithCustomItems.length > 0) {
      console.log('\n✅ BOTH TABLES HAVE DATA:');
      console.log('- Need to check if admin dashboard is filtering correctly');
    } else {
      console.log('\n❌ NO CUSTOM ORDERS FOUND:');
      console.log('- No custom orders in either table');
      console.log('- Need to test order creation flow');
    }

    // Check 4: Admin filtering logic simulation
    console.log('\n🔧 STEP 4: Admin Filtering Simulation');
    console.log('=' .repeat(50));
    
    // Simulate the admin filtering logic
    const adminFilteredOrders = await db.customOrder.findMany({
      where: {
        user: {
          isActive: true,
          email: {
            not: {
              in: [
                'demo@example.com',
                'test@example.com',
                'sample@example.com',
                'placeholder@example.com',
                'noreply@example.com',
                'donotreply@example.com'
              ]
            }
          },
          NOT: [
            { email: { contains: 'demo@' } },
            { email: { contains: 'test@' } },
            { email: { contains: 'sample@' } },
            { email: { contains: 'placeholder@' } },
            { email: { contains: 'fake@' } },
            { email: { contains: 'dummy@' } }
          ]
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(`Orders after admin filtering: ${adminFilteredOrders.length}`);
    
    if (adminFilteredOrders.length > 0) {
      console.log('\nOrders that would appear in admin:');
      adminFilteredOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.user?.email} - ${order.fabric} (${order.status})`);
      });
    }

    // Check 5: Recommendations
    console.log('\n🎯 STEP 5: Recommendations');
    console.log('=' .repeat(50));
    
    if (ordersWithCustomItems.length > customOrders.length) {
      console.log('🔧 RECOMMENDED FIX:');
      console.log('1. Update admin dashboard to query Order table for custom items');
      console.log('2. Or ensure custom order creation also creates CustomOrder records');
      console.log('3. Verify the order creation API is using both tables correctly');
    } else if (customOrders.length > adminFilteredOrders.length) {
      console.log('🔧 RECOMMENDED FIX:');
      console.log('1. Admin filtering is too restrictive');
      console.log('2. Allow legitimate test accounts or adjust filtering');
      console.log('3. Check if real user orders are being filtered out');
    } else if (customOrders.length === 0) {
      console.log('🔧 RECOMMENDED FIX:');
      console.log('1. Test the custom order creation flow');
      console.log('2. Check if orders are being created at all');
      console.log('3. Verify API endpoints are working correctly');
    }

  } catch (error) {
    console.error('❌ Error investigating custom order flow:', error);
  } finally {
    await db.$disconnect();
  }
}

investigateCustomOrderFlow();