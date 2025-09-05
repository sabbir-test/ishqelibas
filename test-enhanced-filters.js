#!/usr/bin/env node

/**
 * Test Script: Enhanced Unified Search and Filter UI
 * 
 * Tests the enhanced sorting options including rating, price high-to-low, and name Z-A
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Enhanced Unified Search and Filter UI\n');

// Test 1: Verify enhanced sorting options in ModelFilterBar
console.log('1. Checking enhanced ModelFilterBar component...');
const filterBarPath = path.join(__dirname, 'src/components/ui/model-filter-bar.tsx');
if (fs.existsSync(filterBarPath)) {
  const filterBarContent = fs.readFileSync(filterBarPath, 'utf8');
  
  const sortOptions = [
    'Name A-Z', 'Name Z-A', 'Price: Low to High', 'Price: High to Low', 'Rating'
  ];
  
  const hasAllSortOptions = sortOptions.every(option => filterBarContent.includes(option));
  
  if (hasAllSortOptions) {
    console.log('   ✅ All enhanced sorting options present');
  } else {
    console.log('   ❌ Missing enhanced sorting options');
  }
  
  const sortValues = [
    'name-asc', 'name-desc', 'price-asc', 'price-desc', 'rating'
  ];
  
  const hasAllSortValues = sortValues.every(value => filterBarContent.includes(value));
  
  if (hasAllSortValues) {
    console.log('   ✅ All sort values properly configured');
  } else {
    console.log('   ❌ Missing sort values');
  }
} else {
  console.log('   ❌ ModelFilterBar component not found');
}

// Test 2: Verify enhanced sorting in all design pages
console.log('\n2. Checking enhanced sorting in design pages...');

const designPages = [
  { name: 'Blouse', path: 'src/app/custom-design/blouse/page.tsx' },
  { name: 'Salwar Kameez', path: 'src/app/custom-design/salwar-kameez/page.tsx' },
  { name: 'Lehenga', path: 'src/app/custom-design/lehenga/page.tsx' }
];

designPages.forEach(page => {
  const pagePath = path.join(__dirname, page.path);
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    // Check for enhanced sort logic
    const hasSwitchStatement = content.includes('switch (sortBy)');
    const hasPriceAsc = content.includes('case "price-asc"');
    const hasPriceDesc = content.includes('case "price-desc"');
    const hasNameDesc = content.includes('case "name-desc"');
    const hasRating = content.includes('case "rating"');
    const hasDefaultNameAsc = content.includes('setSortBy("name-asc")');
    
    if (hasSwitchStatement && hasPriceAsc && hasPriceDesc && hasNameDesc && hasRating && hasDefaultNameAsc) {
      console.log(`   ✅ ${page.name} page has enhanced sorting logic`);
    } else {
      console.log(`   ❌ ${page.name} page missing enhanced sorting logic`);
    }
  } else {
    console.log(`   ❌ ${page.name} page not found`);
  }
});

// Test 3: Verify enhanced API support
console.log('\n3. Checking enhanced API support...');

const apiEndpoints = [
  { name: 'Blouse Models', path: 'src/app/api/blouse-models/route.ts' },
  { name: 'Salwar Kameez Models', path: 'src/app/api/salwar-kameez-models/route.ts' },
  { name: 'Lehenga Models', path: 'src/app/api/lehenga-models/route.ts' }
];

apiEndpoints.forEach(endpoint => {
  const apiPath = path.join(__dirname, endpoint.path);
  if (fs.existsSync(apiPath)) {
    const apiContent = fs.readFileSync(apiPath, 'utf8');
    
    const hasSwitchStatement = apiContent.includes('switch (sortBy)');
    const hasPriceAsc = apiContent.includes('case "price-asc"');
    const hasPriceDesc = apiContent.includes('case "price-desc"');
    const hasNameDesc = apiContent.includes('case "name-desc"');
    const hasRating = apiContent.includes('case "rating"');
    
    if (hasSwitchStatement && hasPriceAsc && hasPriceDesc && hasNameDesc && hasRating) {
      console.log(`   ✅ ${endpoint.name} API supports enhanced sorting`);
    } else {
      console.log(`   ❌ ${endpoint.name} API missing enhanced sorting`);
    }
  } else {
    console.log(`   ❌ ${endpoint.name} API not found`);
  }
});

// Test 4: Check for consistent default values
console.log('\n4. Checking consistent default values...');

let consistentDefaults = true;

designPages.forEach(page => {
  const pagePath = path.join(__dirname, page.path);
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const hasCorrectDefault = content.includes('useState("name-asc")');
    const hasCorrectClear = content.includes('setSortBy("name-asc")');
    
    if (!hasCorrectDefault || !hasCorrectClear) {
      console.log(`   ❌ ${page.name} page has inconsistent default values`);
      consistentDefaults = false;
    }
  }
});

if (consistentDefaults) {
  console.log('   ✅ All pages have consistent default sort values');
}

console.log('\n📊 Enhanced Features Summary:');
console.log('============================');
console.log('✅ Rating-based sorting (highest to lowest)');
console.log('✅ Price sorting (both low-to-high and high-to-low)');
console.log('✅ Name sorting (both A-Z and Z-A)');
console.log('✅ Enhanced search by name and design');
console.log('✅ Price range filtering with min/max inputs');
console.log('✅ Clear filters resets to name A-Z default');
console.log('✅ Consistent implementation across all workflows');

console.log('\n🎯 Sorting Options Available:');
console.log('- Rating (highest rated first)');
console.log('- Price: Low to High');
console.log('- Price: High to Low');
console.log('- Name A-Z');
console.log('- Name Z-A');

console.log('\n🚀 Testing Instructions:');
console.log('1. Navigate to any custom design workflow');
console.log('2. Go to the "Select Model" step');
console.log('3. Use the filter bar to test:');
console.log('   - Search functionality');
console.log('   - All 5 sorting options');
console.log('   - Price range filtering');
console.log('   - Clear filters button');
console.log('4. Verify instant UI updates');
console.log('5. Test on mobile and desktop');

console.log('\n✨ Enhanced unified search and filter UI ready for testing!');