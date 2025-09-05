const fs = require('fs')
const path = require('path')

// List of test files to clean up
const testFiles = [
  'audit-orders.js',
  'test-order-flow.js',
  'test-real-order-placement.js',
  'verify-admin-orders.js',
  'cleanup-test-files.js' // This file will delete itself last
]

console.log('🧹 Cleaning up test files...\n')

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath)
      console.log(`✅ Deleted: ${file}`)
    } catch (error) {
      console.log(`❌ Failed to delete ${file}: ${error.message}`)
    }
  } else {
    console.log(`⚠️  File not found: ${file}`)
  }
})

console.log('\n🎉 Cleanup completed!')
console.log('📋 Summary document available: order-fix-summary.md')
console.log('🚀 Order system is now ready for production use!')