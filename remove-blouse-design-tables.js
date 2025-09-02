const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function removeBlouseDesignTables() {
  try {
    console.log('🗑️ REMOVING BLOUSE DESIGN TABLES\n');

    // Step 1: Backup existing data (optional)
    console.log('📊 Checking existing data...');
    
    const blouseDesigns = await db.blouseDesign.findMany();
    const blouseDesignCategories = await db.blouseDesignCategory.findMany();
    const blouseDesignVariants = await db.blouseDesignVariant.findMany();
    const blouseModels = await db.blouseModel.findMany();

    console.log(`Found ${blouseDesigns.length} blouse designs`);
    console.log(`Found ${blouseDesignCategories.length} blouse design categories`);
    console.log(`Found ${blouseDesignVariants.length} blouse design variants`);
    console.log(`Found ${blouseModels.length} blouse models`);

    if (blouseDesigns.length > 0 || blouseDesignCategories.length > 0 || 
        blouseDesignVariants.length > 0 || blouseModels.length > 0) {
      
      console.log('\n💾 Backing up data to JSON files...');
      
      const fs = require('fs');
      const backupDir = './blouse-design-backup';
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      fs.writeFileSync(`${backupDir}/blouse_designs.json`, JSON.stringify(blouseDesigns, null, 2));
      fs.writeFileSync(`${backupDir}/blouse_design_categories.json`, JSON.stringify(blouseDesignCategories, null, 2));
      fs.writeFileSync(`${backupDir}/blouse_design_variants.json`, JSON.stringify(blouseDesignVariants, null, 2));
      fs.writeFileSync(`${backupDir}/blouse_models.json`, JSON.stringify(blouseModels, null, 2));
      
      console.log('✅ Data backed up successfully');
    }

    // Step 2: Delete data in correct order (respecting foreign key constraints)
    console.log('\n🗑️ Deleting data in correct order...');
    
    // Delete variants first (they reference designs)
    const deletedVariants = await db.blouseDesignVariant.deleteMany();
    console.log(`✅ Deleted ${deletedVariants.count} blouse design variants`);
    
    // Delete models (they reference designs)
    const deletedModels = await db.blouseModel.deleteMany();
    console.log(`✅ Deleted ${deletedModels.count} blouse models`);
    
    // Delete designs (they reference categories)
    const deletedDesigns = await db.blouseDesign.deleteMany();
    console.log(`✅ Deleted ${deletedDesigns.count} blouse designs`);
    
    // Delete categories last
    const deletedCategories = await db.blouseDesignCategory.deleteMany();
    console.log(`✅ Deleted ${deletedCategories.count} blouse design categories`);

    console.log('\n✅ All blouse design data removed successfully');
    console.log('\n⚠️ Note: Database tables still exist in schema');
    console.log('   To completely remove tables, update prisma/schema.prisma and run migration');

  } catch (error) {
    console.error('❌ Error removing blouse design tables:', error);
  } finally {
    await db.$disconnect();
  }
}

removeBlouseDesignTables();