const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testCustomOrdersFiltering() {
  try {
    console.log('🧪 TESTING CUSTOM ORDERS FILTERING\n');

    // Test the new filtering logic
    console.log('📋 Testing filtered query (legitimate users only)...');
    
    const filteredOrders = await db.customOrder.findMany({
      where: {
        user: {
          isActive: true,
          // Exclude demo/test/placeholder email patterns
          email: {
            not: {
              in: [
                // Exact demo emails
                'demo@example.com',
                'test@example.com',
                'sample@example.com',
                'placeholder@example.com',
                'noreply@example.com',
                'donotreply@example.com'
              ]
            }
          },
          // Exclude users with demo/test patterns in email
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

    console.log(`✅ Filtered Orders Count: ${filteredOrders.length}`);

    if (filteredOrders.length > 0) {
      console.log('\n📦 Legitimate Orders Found:');
      filteredOrders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log(`  ID: ${order.id}`);
        console.log(`  User: ${order.user?.name} (${order.user?.email})`);
        console.log(`  Fabric: ${order.fabric}`);
        console.log(`  Price: ₹${order.price}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Created: ${order.createdAt}`);
      });
    } else {
      console.log('\n✅ No legitimate orders found - all demo/test orders filtered out');
    }

    // Compare with unfiltered results
    console.log('\n📊 COMPARISON WITH UNFILTERED DATA:');
    
    const allOrders = await db.customOrder.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`Total Orders (unfiltered): ${allOrders.length}`);
    console.log(`Legitimate Orders (filtered): ${filteredOrders.length}`);
    console.log(`Demo/Test Orders (filtered out): ${allOrders.length - filteredOrders.length}`);

    // Show what was filtered out
    const filteredOutOrders = allOrders.filter(order => 
      !filteredOrders.some(filtered => filtered.id === order.id)
    );

    if (filteredOutOrders.length > 0) {
      console.log('\n❌ Filtered Out Orders:');
      filteredOutOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.user?.email} - ${order.fabric} (${order.status})`);
      });
    }

    console.log('\n🎯 FILTERING EFFECTIVENESS:');
    console.log(`✅ Successfully filtered out ${filteredOutOrders.length} demo/test orders`);
    console.log(`✅ Admin dashboard will now show ${filteredOrders.length} legitimate orders`);
    
    if (filteredOrders.length === 0) {
      console.log('\n💡 RECOMMENDATION:');
      console.log('Since all current orders are demo/test orders, consider:');
      console.log('1. Creating some legitimate test orders with real email patterns');
      console.log('2. Adding a message in the admin UI when no orders are found');
      console.log('3. Providing instructions for testing with legitimate data');
    }

  } catch (error) {
    console.error('❌ Error testing custom orders filtering:', error);
  } finally {
    await db.$disconnect();
  }
}

testCustomOrdersFiltering();