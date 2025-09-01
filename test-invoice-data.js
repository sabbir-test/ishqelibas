const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testInvoiceData() {
  try {
    console.log('🔍 Testing invoice data completeness...\n');

    // Get a sample order with all related data
    const order = await db.order.findFirst({
      where: {
        orderItems: {
          some: {}
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true
          }
        },
        address: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.log('❌ No orders found in database');
      return;
    }

    console.log('📋 Order Details:');
    console.log(`Order ID: ${order.id}`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Status: ${order.status}`);
    console.log(`Total: ₹${order.total}`);
    console.log(`Created: ${order.createdAt}`);

    console.log('\n👤 User Information:');
    console.log(`Name: ${order.user.name || 'N/A'}`);
    console.log(`Email: ${order.user.email}`);
    console.log(`Phone: ${order.user.phone || 'N/A'}`);
    console.log(`Address: ${order.user.address || 'N/A'}`);
    console.log(`City: ${order.user.city || 'N/A'}`);
    console.log(`State: ${order.user.state || 'N/A'}`);
    console.log(`Country: ${order.user.country || 'N/A'}`);
    console.log(`Zip Code: ${order.user.zipCode || 'N/A'}`);

    console.log('\n🏠 Address Information:');
    if (order.address) {
      console.log(`First Name: ${order.address.firstName || 'N/A'}`);
      console.log(`Last Name: ${order.address.lastName || 'N/A'}`);
      console.log(`Phone: ${order.address.phone || 'N/A'}`);
      console.log(`Address: ${order.address.address || 'N/A'}`);
      console.log(`City: ${order.address.city || 'N/A'}`);
      console.log(`State: ${order.address.state || 'N/A'}`);
      console.log(`Zip Code: ${order.address.zipCode || 'N/A'}`);
      console.log(`Country: ${order.address.country || 'N/A'}`);
    } else {
      console.log('❌ No address record linked to this order');
    }

    console.log('\n📦 Order Items:');
    order.orderItems.forEach((item, index) => {
      console.log(`\nItem ${index + 1}:`);
      console.log(`  Product ID: ${item.productId}`);
      console.log(`  Product Name: ${item.product?.name || 'N/A'}`);
      console.log(`  SKU: ${item.product?.sku || 'N/A'}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Size: ${item.size || 'N/A'}`);
      console.log(`  Color: ${item.color || 'N/A'}`);
      console.log(`  Images: ${item.product?.images || 'N/A'}`);
    });

    console.log('\n🔍 Invoice Data Issues Analysis:');
    
    // Check for missing address data
    const addressIssues = [];
    if (!order.address) {
      addressIssues.push('No address record linked to order');
    } else {
      if (!order.address.firstName && !order.address.lastName) {
        addressIssues.push('Missing customer name in address');
      }
      if (!order.address.phone) {
        addressIssues.push('Missing phone number in address');
      }
      if (!order.address.address) {
        addressIssues.push('Missing street address');
      }
      if (!order.address.city) {
        addressIssues.push('Missing city');
      }
      if (!order.address.state) {
        addressIssues.push('Missing state');
      }
      if (!order.address.zipCode) {
        addressIssues.push('Missing zip code');
      }
    }

    // Check for missing user data
    const userIssues = [];
    if (!order.user.name) {
      userIssues.push('Missing user name');
    }
    if (!order.user.phone) {
      userIssues.push('Missing user phone');
    }
    if (!order.user.address) {
      userIssues.push('Missing user address');
    }

    // Check for missing product data
    const productIssues = [];
    order.orderItems.forEach((item, index) => {
      if (!item.product) {
        productIssues.push(`Item ${index + 1}: Product not found`);
      } else {
        if (!item.product.name) {
          productIssues.push(`Item ${index + 1}: Missing product name`);
        }
        if (!item.size) {
          productIssues.push(`Item ${index + 1}: Missing size information`);
        }
        if (!item.color) {
          productIssues.push(`Item ${index + 1}: Missing color information`);
        }
      }
    });

    console.log('\n📊 Summary of Issues:');
    if (addressIssues.length > 0) {
      console.log('🏠 Address Issues:');
      addressIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (userIssues.length > 0) {
      console.log('👤 User Issues:');
      userIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (productIssues.length > 0) {
      console.log('📦 Product Issues:');
      productIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    if (addressIssues.length === 0 && userIssues.length === 0 && productIssues.length === 0) {
      console.log('✅ No data issues found - invoice should display complete information');
    }

    // Test the current invoice generation
    console.log('\n🧪 Testing current invoice generation...');
    
    const shippingAddress = order.address ? {
      name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim(),
      phone: order.address.phone || 'N/A',
      address: order.address.address || 'N/A',
      city: order.address.city || 'N/A',
      state: order.address.state || 'N/A',
      pincode: order.address.zipCode || 'N/A'
    } : {};

    console.log('Shipping Address for Invoice:');
    console.log(JSON.stringify(shippingAddress, null, 2));

    console.log('\nBilling Address for Invoice (from user):');
    console.log(`Name: ${order.user.name || 'N/A'}`);
    console.log(`Phone: ${order.user.phone || 'N/A'}`);
    console.log(`Address: ${order.user.address || 'N/A'}`);
    console.log(`City: ${order.user.city || 'N/A'}`);
    console.log(`State: ${order.user.state || 'N/A'}`);
    console.log(`Zip: ${order.user.zipCode || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error testing invoice data:', error);
  } finally {
    await db.$disconnect();
  }
}

testInvoiceData();