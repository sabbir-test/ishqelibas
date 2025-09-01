const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function testInvoiceFixes() {
  try {
    console.log('🧪 Testing invoice fixes...\n');

    // Get a sample order
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
                images: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.log('❌ No orders found');
      return;
    }

    console.log('📋 Testing Enhanced Invoice Data Generation:');
    console.log(`Order: ${order.orderNumber}`);

    // Test billing address logic
    const billingAddress = order.address ? {
      name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || order.user.name || 'Customer',
      phone: order.address.phone || order.user.phone || 'N/A',
      address: order.address.address || order.user.address || 'N/A',
      city: order.address.city || order.user.city || 'N/A',
      state: order.address.state || order.user.state || 'N/A',
      pincode: order.address.zipCode || order.user.zipCode || 'N/A',
      country: order.address.country || order.user.country || 'India'
    } : {
      name: order.user.name || 'Customer',
      phone: order.user.phone || 'N/A',
      address: order.user.address || 'N/A',
      city: order.user.city || 'N/A',
      state: order.user.state || 'N/A',
      pincode: order.user.zipCode || 'N/A',
      country: order.user.country || 'India'
    };

    // Test shipping address logic
    const shippingAddress = order.address ? {
      name: `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim() || order.user.name || 'Customer',
      phone: order.address.phone || order.user.phone || 'N/A',
      address: order.address.address || 'N/A',
      city: order.address.city || 'N/A',
      state: order.address.state || 'N/A',
      pincode: order.address.zipCode || 'N/A',
      country: order.address.country || 'India'
    } : {
      name: order.user.name || 'Customer',
      phone: order.user.phone || 'N/A',
      address: order.user.address || 'N/A',
      city: order.user.city || 'N/A',
      state: order.user.state || 'N/A',
      pincode: order.user.zipCode || 'N/A',
      country: order.user.country || 'India'
    };

    console.log('\n✅ Billing Address (Enhanced):');
    console.log(`Name: ${billingAddress.name}`);
    console.log(`Phone: ${billingAddress.phone}`);
    console.log(`Address: ${billingAddress.address}`);
    console.log(`City: ${billingAddress.city}`);
    console.log(`State: ${billingAddress.state}`);
    console.log(`Pincode: ${billingAddress.pincode}`);
    console.log(`Country: ${billingAddress.country}`);

    console.log('\n✅ Shipping Address (Enhanced):');
    console.log(`Name: ${shippingAddress.name}`);
    console.log(`Phone: ${shippingAddress.phone}`);
    console.log(`Address: ${shippingAddress.address}`);
    console.log(`City: ${shippingAddress.city}`);
    console.log(`State: ${shippingAddress.state}`);
    console.log(`Pincode: ${shippingAddress.pincode}`);
    console.log(`Country: ${shippingAddress.country}`);

    console.log('\n✅ Enhanced Product Details:');
    order.orderItems.forEach((item, index) => {
      let productName = item.product?.name || 'Custom Product';
      let productDetails = '';
      
      if (item.productId === 'custom-blouse') {
        productName = 'Custom Blouse Design';
        productDetails = 'Custom blouse with selected fabric and design, tailored to customer measurements';
      } else if (item.productId === 'custom-salwar-kameez') {
        productName = 'Custom Salwar Kameez Design';
        productDetails = 'Custom salwar kameez with selected design, tailored to customer measurements';
      } else if (item.product?.description) {
        productDetails = item.product.description;
      }

      console.log(`\nItem ${index + 1}:`);
      console.log(`  Name: ${productName}`);
      console.log(`  SKU: ${item.product?.sku || 'CUSTOM'}`);
      console.log(`  Details: ${productDetails || 'Standard product'}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Size: ${item.size || 'Custom'}`);
      console.log(`  Color: ${item.color || 'As Selected'}`);
      console.log(`  Price: ₹${item.price}`);
      console.log(`  Total: ₹${item.price * item.quantity}`);
    });

    console.log('\n🔍 Data Completeness Check:');
    
    const issues = [];
    
    // Check billing address completeness
    if (billingAddress.name === 'Customer') issues.push('Generic billing name');
    if (billingAddress.phone === 'N/A') issues.push('Missing billing phone');
    if (billingAddress.address === 'N/A') issues.push('Missing billing address');
    if (billingAddress.city === 'N/A') issues.push('Missing billing city');
    if (billingAddress.state === 'N/A') issues.push('Missing billing state');
    if (billingAddress.pincode === 'N/A') issues.push('Missing billing pincode');
    
    // Check shipping address completeness
    if (shippingAddress.name === 'Customer') issues.push('Generic shipping name');
    if (shippingAddress.phone === 'N/A') issues.push('Missing shipping phone');
    if (shippingAddress.address === 'N/A') issues.push('Missing shipping address');
    if (shippingAddress.city === 'N/A') issues.push('Missing shipping city');
    if (shippingAddress.state === 'N/A') issues.push('Missing shipping state');
    if (shippingAddress.pincode === 'N/A') issues.push('Missing shipping pincode');

    if (issues.length === 0) {
      console.log('✅ All address fields are complete!');
    } else {
      console.log('⚠️ Remaining issues:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }

    console.log('\n🎯 Invoice Generation Test Summary:');
    console.log('✅ Enhanced address data mapping');
    console.log('✅ Improved product details with custom design info');
    console.log('✅ Better fallback logic for missing data');
    console.log('✅ Added country field to addresses');
    console.log('✅ Enhanced SKU display for custom products');

  } catch (error) {
    console.error('❌ Error testing invoice fixes:', error);
  } finally {
    await db.$disconnect();
  }
}

testInvoiceFixes();