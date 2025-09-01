const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function createLegitimateTestOrder() {
  try {
    console.log('🧪 CREATING LEGITIMATE TEST ORDER\n');

    // Create a legitimate test user
    const testUser = await db.user.upsert({
      where: { email: 'customer@gmail.com' },
      update: {},
      create: {
        email: 'customer@gmail.com',
        name: 'Sarah Johnson',
        password: 'hashedpassword123',
        phone: '+91 9876543210',
        address: '123 Fashion Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001',
        role: 'USER',
        isActive: true
      }
    });

    console.log(`✅ Created/found user: ${testUser.email}`);

    // Create a custom order for this user
    const customOrder = await db.customOrder.create({
      data: {
        userId: testUser.id,
        fabric: 'Silk',
        fabricColor: '#FF6B6B',
        frontDesign: 'Embroidered Neck',
        backDesign: 'Deep Back',
        oldMeasurements: JSON.stringify({
          chest: 36,
          waist: 32,
          blouseLength: 15,
          shoulder: 14
        }),
        price: 3500,
        notes: 'Custom silk blouse with embroidered front',
        status: 'PENDING'
      }
    });

    console.log(`✅ Created custom order: ${customOrder.id}`);

    // Create corresponding regular order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: testUser.id,
        status: 'PENDING',
        subtotal: 3500,
        discount: 0,
        tax: 0,
        shipping: 100,
        total: 3600,
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING'
      }
    });

    // Create order item
    await db.orderItem.create({
      data: {
        orderId: order.id,
        productId: 'custom-blouse',
        quantity: 1,
        price: 3500,
        size: 'Custom',
        color: 'Red'
      }
    });

    console.log(`✅ Created order: ${order.orderNumber}`);

    // Test admin filtering with new order
    console.log('\n🔍 Testing admin filtering with new order...');
    
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

    console.log(`Orders after filtering: ${adminFilteredOrders.length}`);
    
    if (adminFilteredOrders.length > 0) {
      console.log('\n✅ SUCCESS! Orders that will appear in admin:');
      adminFilteredOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.user?.name} (${order.user?.email})`);
        console.log(`     Fabric: ${order.fabric}, Price: ₹${order.price}, Status: ${order.status}`);
      });
    } else {
      console.log('\n❌ No orders found after filtering');
    }

    console.log('\n🎯 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    await db.$disconnect();
  }
}

createLegitimateTestOrder();