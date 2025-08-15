const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ishqelibas.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      return existingAdmin;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@ishqelibas.com',
        name: 'Admin User',
        password: hashedPassword,
        phone: '+91 98765 43211',
        address: 'Admin Office, Ishq-e-Libas Headquarters',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Login Credentials:');
    console.log('Email: admin@ishqelibas.com');
    console.log('Password: admin123');
    
    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser();