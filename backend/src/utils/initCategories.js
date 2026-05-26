import Category from '../models/Category.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const initCategories = async () => {
  try {
    await connectDB();

    const defaultCategories = [
      'Wedding',
      'Corporate',
      'Fashion',
      'Portrait',
      'Event',
      'Product',
    ];

    console.log('Initializing default categories...');

    for (const name of defaultCategories) {
      const existing = await Category.findOne({ name });
      if (!existing) {
        await Category.create({ name, isDefault: true });
        console.log(`✓ Created category: ${name}`);
      } else {
        console.log(`- Category already exists: ${name}`);
      }
    }

    console.log('\n✅ Categories initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing categories:', error);
    process.exit(1);
  }
};

initCategories();
