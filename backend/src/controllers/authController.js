import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: {
      user: { _id: user._id, email: user.email, name: user.name, avatar: user.avatar, role: user.role },
    },
  });
});

// @desc    Get all admins
// @route   GET /api/auth/admins
// @access  Private
export const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find().select('-password').sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: admins });
});

// @desc    Create new admin
// @route   POST /api/auth/admins
// @access  Private
export const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('An admin with this email already exists');
  }
  const user = await User.create({ email, password, name: name || 'Admin' });
  res.status(201).json({
    success: true,
    data: { _id: user._id, email: user.email, name: user.name, role: user.role },
  });
});

// @desc    Delete admin
// @route   DELETE /api/auth/admins/:id
// @access  Private
export const deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Admin not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'Admin removed' });
});

// @desc    Update own profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'rona-studio/profiles', resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });
    user.avatar = result.secure_url;
  }

  await user.save();
  res.status(200).json({
    success: true,
    data: { _id: user._id, email: user.email, name: user.name, avatar: user.avatar },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Both current and new password are required');
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});
