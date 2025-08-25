const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debug() {
  try {
    console.log('=== Debug Database ===');
    
    // Check demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
      select: { id: true, email: true, name: true, city: true, state: true }
    });
    console.log('Demo User:', demoUser);
    
    // Check all orders for demo user
    if (demoUser) {
      const orders = await prisma.order.findMany({
        where: { userId: demoUser.id },
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, images: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log('\nOrders for demo user:', orders.length);
      orders.forEach(order => {
        console.log(`\nOrder #${order.orderNumber}`);
        console.log(`- ID: ${order.id}`);
        console.log(`- Status: ${order.status}`);
        console.log(`- Total: ${order.total}`);
        console.log(`- Shipping Address: ${order.shippingAddress}`);
        console.log(`- Items: ${order.orderItems.length}`);
        order.orderItems.forEach(item => {
          console.log(`  - ${item.product?.name || 'Unknown Product'} (${item.quantity}x ${item.price})`);
        });
      });
    }
    
    // Check all orders in database
    const allOrders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log('\n=== All Orders (first 10) ===');
    allOrders.forEach(order => {
      console.log(`Order #${order.orderNumber} - User: ${order.user.email} (${order.user.id})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();