import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ isDefault: -1, name: 1 });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') } 
  });

  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({ name });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (category.isDefault) {
    res.status(400);
    throw new Error('Cannot delete default category');
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// @desc    Initialize default categories
// @route   POST /api/categories/init
// @access  Private
export const initCategories = asyncHandler(async (req, res) => {
  const defaultCategories = [
    'Wedding',
    'Corporate',
    'Fashion',
    'Portrait',
    'Event',
    'Product',
  ];

  const createdCategories = [];

  for (const name of defaultCategories) {
    const existing = await Category.findOne({ name });
    if (!existing) {
      const category = await Category.create({ name, isDefault: true });
      createdCategories.push(category);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Default categories initialized',
    data: createdCategories,
  });
});
