const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testUpdatedAdminFiltering() {
  try {
    console.log('🧪 TESTING UPDATED ADMIN FILTERING\n');

    // Test the updated filtering logic
    const orders = await db.customOrder.findMany({
      where: {
        user: {
          isActive: true,
          // Updated filtering logic
          NOT: [
            { email: { contains: 'test-dummy@' } },
            { email: { contains: 'sample@' } },
            { email: { contains: 'placeholder@' } },
            { email: { contains: 'fake@' } },
            { email: { contains: 'dummy@' } },
            { email: { contains: 'noreply@' } },
            { email: { contains: 'donotreply@' } },
            // Exclude obvious test patterns but keep demo@example.com
            { email: 'test@example.com' },
            { email: 'sample@example.com' }
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

    console.log(`📊 Orders found with updated filtering: ${orders.length}`);

    if (orders.length > 0) {
      console.log('\n📋 Orders that will appear in admin dashboard:');
      
      const emailGroups = {};
      orders.forEach(order => {
        const email = order.user?.email || 'unknown';
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(order);
      });

      Object.entries(emailGroups).forEach(([email, userOrders]) => {
        const isDemo = email === 'demo@example.com';
        const isLegitimate = !email.includes('demo') && !email.includes('test');
        
        console.log(`\n${isDemo ? '🧪' : isLegitimate ? '✅' : '⚠️'} ${email} (${userOrders.length} orders):`);
        
        userOrders.slice(0, 3).forEach((order, index) => {
          console.log(`  ${index + 1}. ${order.fabric} - ₹${order.price} (${order.status}) - ${new Date(order.createdAt).toLocaleDateString()}`);
        });
        
        if (userOrders.length > 3) {
          console.log(`  ... and ${userOrders.length - 3} more orders`);
        }
      });

      console.log('\n🎯 FILTERING RESULTS:');
      const demoOrders = orders.filter(o => o.user?.email === 'demo@example.com').length;
      const legitimateOrders = orders.filter(o => o.user?.email && !o.user.email.includes('demo') && !o.user.email.includes('test')).length;
      const testOrders = orders.filter(o => o.user?.email === 'test@example.com').length;
      
      console.log(`✅ Demo orders (for testing): ${demoOrders}`);
      console.log(`✅ Legitimate user orders: ${legitimateOrders}`);
      console.log(`❌ Test orders (filtered out): ${testOrders}`);
      console.log(`📊 Total visible in admin: ${orders.length}`);

    } else {
      console.log('\n❌ No orders found - admin dashboard will show empty state');
    }

    // Verify specific test cases
    console.log('\n🔍 VERIFICATION TESTS:');
    console.log('=' .repeat(50));
    
    // Check if demo@example.com orders are included
    const demoOrdersCount = orders.filter(o => o.user?.email === 'demo@example.com').length;
    console.log(`✅ demo@example.com orders included: ${demoOrdersCount > 0 ? 'YES' : 'NO'} (${demoOrdersCount})`);
    
    // Check if test@example.com orders are excluded
    const testOrdersCount = orders.filter(o => o.user?.email === 'test@example.com').length;
    console.log(`✅ test@example.com orders excluded: ${testOrdersCount === 0 ? 'YES' : 'NO'} (${testOrdersCount})`);
    
    // Check if legitimate orders are included
    const legitimateOrdersCount = orders.filter(o => {
      const email = o.user?.email || '';
      return !email.includes('demo') && !email.includes('test') && !email.includes('sample');
    }).length;
    console.log(`✅ Legitimate orders included: ${legitimateOrdersCount > 0 ? 'YES' : 'NO'} (${legitimateOrdersCount})`);

    console.log('\n🚀 ADMIN DASHBOARD IMPACT:');
    console.log('- Demo orders will be visible for testing custom order flow');
    console.log('- Legitimate user orders will appear immediately when placed');
    console.log('- Obvious test/dummy accounts are still filtered out');
    console.log('- Admin can see and manage all real custom orders');

  } catch (error) {
    console.error('❌ Error testing updated filtering:', error);
  } finally {
    await db.$disconnect();
  }
}

testUpdatedAdminFiltering();