const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateDemoUser() {
  try {
    console.log('Updating demo user with hashed password...');

    // Check if demo user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (!existingUser) {
      console.log('Demo user not found. Creating new one...');
      
      // Hash the password
      const hashedPassword = bcrypt.hashSync('demo123', 10);

      // Create demo user
      const demoUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User',
          password: hashedPassword,
          phone: '+91 98765 43210',
          address: '123 Demo Street, Demo City',
          city: 'Demo City',
          state: 'Demo State',
          country: 'India',
          zipCode: '123456',
          role: 'USER',
          isActive: true
        }
      });

      console.log('Demo user created successfully:', demoUser);
    } else {
      // Update existing user with hashed password
      const hashedPassword = bcrypt.hashSync('demo123', 10);
      
      const updatedUser = await prisma.user.update({
        where: { email: 'demo@example.com' },
        data: {
          password: hashedPassword
        }
      });

      console.log('Demo user password updated successfully:', updatedUser);
    }

  } catch (error) {
    console.error('Error updating demo user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateDemoUser()
  .then(() => {
    console.log('✅ Demo user updated successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');
    console.log('\n🎯 You can now test the custom design blouse purchase flow!');
  })
  .catch((error) => {
    console.error('❌ Error updating demo user:', error);
  });