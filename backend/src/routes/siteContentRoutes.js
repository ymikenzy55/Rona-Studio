import express from 'express';
import {
  getAllContent,
  getContentBySection,
  updateContent,
  initializeContent,
} from '../controllers/siteContentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllContent);
router.get('/:section', getContentBySection);
router.put('/:section', protect, admin, updateContent);
router.post('/init', protect, admin, initializeContent);

export default router;
