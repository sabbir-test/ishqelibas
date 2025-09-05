const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing Products API...\n');

    // Test 1: Get all products
    console.log('1. Testing all products:');
    const allResponse = await fetch('http://localhost:3000/api/products');
    const allData = await allResponse.json();
    console.log(`Status: ${allResponse.status}`);
    console.log(`Found ${allData.products?.length || 0} products`);
    
    if (allData.products && allData.products.length > 0) {
      console.log('Sample products:');
      allData.products.slice(0, 3).forEach(product => {
        console.log(`- ${product.name} (Category: ${product.category})`);
      });
    }

    // Test 2: Get saree products
    console.log('\n2. Testing saree category filter:');
    const sareeResponse = await fetch('http://localhost:3000/api/products?category=sarees');
    const sareeData = await sareeResponse.json();
    console.log(`Status: ${sareeResponse.status}`);
    console.log(`Found ${sareeData.products?.length || 0} saree products`);
    
    if (sareeData.products && sareeData.products.length > 0) {
      console.log('Saree products:');
      sareeData.products.forEach(product => {
        console.log(`- ${product.name} (Category: ${product.category})`);
      });
    }

    // Test 3: Get kurtis products
    console.log('\n3. Testing kurtis category filter:');
    const kurtisResponse = await fetch('http://localhost:3000/api/products?category=kurtis');
    const kurtisData = await kurtisResponse.json();
    console.log(`Status: ${kurtisResponse.status}`);
    console.log(`Found ${kurtisData.products?.length || 0} kurtis products`);
    
    if (kurtisData.products && kurtisData.products.length > 0) {
      console.log('Kurtis products:');
      kurtisData.products.forEach(product => {
        console.log(`- ${product.name} (Category: ${product.category})`);
      });
    }

    // Test 4: Test invalid category
    console.log('\n4. Testing invalid category filter:');
    const invalidResponse = await fetch('http://localhost:3000/api/products?category=invalid');
    const invalidData = await invalidResponse.json();
    console.log(`Status: ${invalidResponse.status}`);
    console.log(`Found ${invalidData.products?.length || 0} products for invalid category`);

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();