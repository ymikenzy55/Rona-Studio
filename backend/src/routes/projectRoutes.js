import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  getProjectsByCategory,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/category/:category', getProjectsByCategory);
router.get('/:slug', getProjectBySlug);

router.post(
  '/',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'images', maxCount: 20 },
    { name: 'videos', maxCount: 5 },
    { name: 'sectionMedia', maxCount: 20 },
  ]),
  createProject
);

router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'images', maxCount: 20 },
    { name: 'sectionMedia', maxCount: 20 },
  ]),
  updateProject
);
router.delete('/:id', protect, deleteProject);

export default router;
