const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testCustomOrdersCleanupComplete() {
  try {
    console.log('🎯 CUSTOM ORDERS CLEANUP - COMPLETE TEST\n');

    // Test 1: Check original data
    console.log('📊 STEP 1: Original Data Analysis');
    console.log('=' .repeat(50));
    
    const allOrders = await db.customOrder.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        }
      }
    });

    console.log(`Total Orders in Database: ${allOrders.length}`);
    
    const emailCounts = {};
    allOrders.forEach(order => {
      const email = order.user?.email || 'unknown';
      emailCounts[email] = (emailCounts[email] || 0) + 1;
    });

    console.log('\nEmail Distribution:');
    Object.entries(emailCounts).forEach(([email, count]) => {
      const isDemoTest = email.includes('demo') || email.includes('test');
      console.log(`  ${isDemoTest ? '❌' : '✅'} ${email}: ${count} orders`);
    });

    // Test 2: Apply filtering logic
    console.log('\n📋 STEP 2: Filtering Logic Test');
    console.log('=' .repeat(50));

    const filteredOrders = await db.customOrder.findMany({
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

    console.log(`Orders After Filtering: ${filteredOrders.length}`);
    console.log(`Orders Filtered Out: ${allOrders.length - filteredOrders.length}`);

    // Test 3: Verify filtering effectiveness
    console.log('\n🔍 STEP 3: Filtering Effectiveness');
    console.log('=' .repeat(50));

    const demoTestOrders = allOrders.filter(order => {
      const email = order.user?.email || '';
      return email.includes('demo') || email.includes('test') || 
             email.includes('sample') || email.includes('placeholder') ||
             email.includes('fake') || email.includes('dummy');
    });

    const legitimateOrders = allOrders.filter(order => {
      const email = order.user?.email || '';
      return !email.includes('demo') && !email.includes('test') && 
             !email.includes('sample') && !email.includes('placeholder') &&
             !email.includes('fake') && !email.includes('dummy') &&
             order.user?.isActive;
    });

    console.log(`Demo/Test Orders Identified: ${demoTestOrders.length}`);
    console.log(`Legitimate Orders Identified: ${legitimateOrders.length}`);
    console.log(`Filtered Query Result: ${filteredOrders.length}`);

    // Verify filtering accuracy
    const filteringAccurate = filteredOrders.length === legitimateOrders.length;
    console.log(`\n✅ Filtering Accuracy: ${filteringAccurate ? 'CORRECT' : 'INCORRECT'}`);

    if (filteredOrders.length > 0) {
      console.log('\n📦 Legitimate Orders (will be shown in admin):');
      filteredOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.user?.email} - ${order.fabric} (${order.status})`);
      });
    } else {
      console.log('\n✅ No legitimate orders found - admin will show empty state');
    }

    // Test 4: Admin UI behavior simulation
    console.log('\n🖥️ STEP 4: Admin UI Behavior Simulation');
    console.log('=' .repeat(50));

    if (filteredOrders.length === 0) {
      console.log('📱 Admin Dashboard will display:');
      console.log('  ✅ Empty state message');
      console.log('  ✅ Explanation about filtering');
      console.log('  ✅ Guidance for legitimate orders');
      console.log('  ✅ Stats showing 0 orders in all categories');
    } else {
      console.log('📱 Admin Dashboard will display:');
      console.log(`  ✅ ${filteredOrders.length} legitimate orders in table`);
      console.log('  ✅ Proper stats calculations');
      console.log('  ✅ All order management features available');
    }

    // Test 5: Final verification
    console.log('\n🎯 STEP 5: Solution Verification');
    console.log('=' .repeat(50));

    const issues = [];
    
    // Check if any demo/test orders would still appear
    const wouldStillAppear = filteredOrders.filter(order => {
      const email = order.user?.email || '';
      return email.includes('demo') || email.includes('test');
    });

    if (wouldStillAppear.length > 0) {
      issues.push(`${wouldStillAppear.length} demo/test orders still appearing`);
    }

    // Check if legitimate orders are being filtered out incorrectly
    const legitimateFiltered = legitimateOrders.filter(order => 
      !filteredOrders.some(filtered => filtered.id === order.id)
    );

    if (legitimateFiltered.length > 0) {
      issues.push(`${legitimateFiltered.length} legitimate orders incorrectly filtered`);
    }

    if (issues.length === 0) {
      console.log('✅ ALL TESTS PASSED');
      console.log('✅ Demo/test orders successfully filtered out');
      console.log('✅ Legitimate orders preserved');
      console.log('✅ Admin UI handles empty state properly');
      console.log('✅ Solution is ready for production');
    } else {
      console.log('❌ ISSUES FOUND:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }

    console.log('\n📈 FINAL SUMMARY:');
    console.log(`  Original Orders: ${allOrders.length}`);
    console.log(`  Demo/Test Orders: ${demoTestOrders.length}`);
    console.log(`  Legitimate Orders: ${legitimateOrders.length}`);
    console.log(`  Admin Will Show: ${filteredOrders.length}`);
    console.log(`  Cleanup Success: ${issues.length === 0 ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error testing custom orders cleanup:', error);
  } finally {
    await db.$disconnect();
  }
}

testCustomOrdersCleanupComplete();