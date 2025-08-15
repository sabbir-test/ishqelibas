const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('Checking for admin users...');
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database.');
      console.log('📝 Available users:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      });
      
      allUsers.forEach(user => {
        console.log(`- ${user.email} (${user.name}) - Role: ${user.role}, Active: ${user.isActive}`);
      });
    } else {
      console.log('✅ Found admin users:');
      adminUsers.forEach(admin => {
        console.log(`- ${admin.email} (${admin.name}) - Active: ${admin.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();