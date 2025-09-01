const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function auditCustomOrders() {
  try {
    console.log('🔍 AUDITING CUSTOM ORDERS DATA\n');

    // Get all custom orders with user data
    const orders = await db.customOrder.findMany({
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

    console.log(`📊 Total Custom Orders: ${orders.length}\n`);

    if (orders.length === 0) {
      console.log('✅ No custom orders found - database is clean');
      return;
    }

    // Analyze orders for demo/test patterns
    console.log('📋 DETAILED ORDER ANALYSIS:');
    console.log('=' .repeat(80));

    const demoPatterns = {
      demoEmails: [],
      testEmails: [],
      placeholderEmails: [],
      duplicateUsers: {},
      suspiciousOrders: []
    };

    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  User: ${order.user?.name || 'N/A'} (${order.user?.email || 'N/A'})`);
      console.log(`  Fabric: ${order.fabric}`);
      console.log(`  Front Design: ${order.frontDesign}`);
      console.log(`  Back Design: ${order.backDesign}`);
      console.log(`  Price: ₹${order.price}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Created: ${order.createdAt}`);

      // Check for demo/test patterns
      const email = order.user?.email || '';
      
      // Demo email patterns
      if (email.includes('demo') || email.includes('test') || email.includes('sample')) {
        if (email.includes('demo')) demoPatterns.demoEmails.push(email);
        if (email.includes('test')) demoPatterns.testEmails.push(email);
        if (email.includes('sample')) demoPatterns.placeholderEmails.push(email);
      }

      // Track duplicate users
      if (email) {
        if (!demoPatterns.duplicateUsers[email]) {
          demoPatterns.duplicateUsers[email] = [];
        }
        demoPatterns.duplicateUsers[email].push(order.id);
      }

      // Check for suspicious patterns
      if (order.fabric === 'Cotton' && order.frontDesign === 'Simple' && order.backDesign === 'Plain') {
        demoPatterns.suspiciousOrders.push(order.id);
      }
    });

    console.log('\n🔍 PATTERN ANALYSIS:');
    console.log('=' .repeat(50));

    // Demo emails
    if (demoPatterns.demoEmails.length > 0) {
      console.log(`\n❌ Demo Emails Found (${demoPatterns.demoEmails.length}):`);
      [...new Set(demoPatterns.demoEmails)].forEach(email => {
        console.log(`  - ${email}`);
      });
    }

    // Test emails
    if (demoPatterns.testEmails.length > 0) {
      console.log(`\n❌ Test Emails Found (${demoPatterns.testEmails.length}):`);
      [...new Set(demoPatterns.testEmails)].forEach(email => {
        console.log(`  - ${email}`);
      });
    }

    // Placeholder emails
    if (demoPatterns.placeholderEmails.length > 0) {
      console.log(`\n❌ Placeholder Emails Found (${demoPatterns.placeholderEmails.length}):`);
      [...new Set(demoPatterns.placeholderEmails)].forEach(email => {
        console.log(`  - ${email}`);
      });
    }

    // Duplicate users (multiple orders from same user)
    const duplicateEmails = Object.entries(demoPatterns.duplicateUsers)
      .filter(([email, orders]) => orders.length > 1);
    
    if (duplicateEmails.length > 0) {
      console.log(`\n📊 Users with Multiple Orders (${duplicateEmails.length}):`);
      duplicateEmails.forEach(([email, orderIds]) => {
        console.log(`  - ${email}: ${orderIds.length} orders`);
      });
    }

    // Suspicious orders
    if (demoPatterns.suspiciousOrders.length > 0) {
      console.log(`\n⚠️ Suspicious Orders (${demoPatterns.suspiciousOrders.length}):`);
      console.log('  (Orders with generic Cotton/Simple/Plain pattern)');
      demoPatterns.suspiciousOrders.forEach(orderId => {
        console.log(`  - ${orderId}`);
      });
    }

    // Recommendations
    console.log('\n🎯 CLEANUP RECOMMENDATIONS:');
    console.log('=' .repeat(50));

    const totalDemoOrders = [...new Set([
      ...demoPatterns.demoEmails,
      ...demoPatterns.testEmails,
      ...demoPatterns.placeholderEmails
    ])].length;

    if (totalDemoOrders > 0) {
      console.log('❌ DEMO/TEST ORDERS FOUND - Cleanup needed');
      console.log('  1. Filter out demo/test email patterns');
      console.log('  2. Add email validation to admin API');
      console.log('  3. Implement legitimate user filtering');
    } else {
      console.log('✅ NO DEMO/TEST PATTERNS DETECTED');
      console.log('  - All orders appear to be from legitimate users');
      console.log('  - No cleanup needed for email patterns');
    }

    // Check for inactive users
    const inactiveUserOrders = orders.filter(order => !order.user?.isActive);
    if (inactiveUserOrders.length > 0) {
      console.log(`\n⚠️ Orders from inactive users: ${inactiveUserOrders.length}`);
      console.log('  Consider filtering these out as well');
    }

    console.log('\n📈 SUMMARY:');
    console.log(`  Total Orders: ${orders.length}`);
    console.log(`  Unique Users: ${Object.keys(demoPatterns.duplicateUsers).length}`);
    console.log(`  Demo/Test Orders: ${totalDemoOrders}`);
    console.log(`  Legitimate Orders: ${orders.length - totalDemoOrders}`);
    console.log(`  Inactive User Orders: ${inactiveUserOrders.length}`);

  } catch (error) {
    console.error('❌ Error auditing custom orders:', error);
  } finally {
    await db.$disconnect();
  }
}

auditCustomOrders();