import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@ronastudio.com',
      password: process.env.ADMIN_PASSWORD || '!@Password12345',
      role: 'admin',
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${admin.email}`);
    console.log('Password: (check your .env file)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
