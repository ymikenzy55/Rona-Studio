import express from 'express';
import {
  getContactMessages,
  getContactMessageById,
  createContactMessage,
  markAsRead,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getContactMessages);
router.get('/:id', protect, getContactMessageById);
router.post('/', createContactMessage);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteContactMessage);

export default router;
