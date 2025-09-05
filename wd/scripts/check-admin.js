const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('Checking all users in database...');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in the database.');
    } else {
      console.log(`✅ Found ${allUsers.length} users:`);
      allUsers.forEach(user => {
        const roleBadge = user.role === 'ADMIN' ? '🔧 ADMIN' : '👤 USER';
        const statusBadge = user.isActive ? '✅ Active' : '❌ Inactive';
        console.log(`- ${user.email} (${user.name}) - ${roleBadge} - ${statusBadge}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    // Count by role
    const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
    const userCount = allUsers.filter(u => u.role === 'USER').length;
    
    console.log('📊 User Statistics:');
    console.log(`Admin Users: ${adminCount}`);
    console.log(`Regular Users: ${userCount}`);
    console.log(`Total Users: ${allUsers.length}`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();