import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
  initCategories,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, createCategory);
router.post('/init', protect, initCategories);
router.delete('/:id', protect, deleteCategory);

export default router;
