import express from 'express';
import { login, verifyToken, getAdmins, createAdmin, deleteAdmin, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', protect, verifyToken);

router.get('/admins', protect, getAdmins);
router.post('/admins', protect, createAdmin);
router.delete('/admins/:id', protect, deleteAdmin);

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
