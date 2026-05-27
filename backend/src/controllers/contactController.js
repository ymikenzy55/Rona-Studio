import asyncHandler from 'express-async-handler';
import Contact from '../models/Contact.js';
import { sendContactEmail } from '../services/emailService.js';
import { io } from '../server.js';

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private
export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await Contact.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: messages,
  });
});

// @desc    Get contact message by ID
// @route   GET /api/contact/:id
// @access  Private
export const getContactMessageById = asyncHandler(async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
export const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Please provide name, email, and message');
  }

  // Create contact message
  const contactMessage = await Contact.create({
    name,
    email,
    subject,
    message,
  });

  // Send email notification
  try {
    await sendContactEmail(contactMessage);
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't fail the request if email fails
  }

  // Emit WebSocket notification to admin
  io.to('admin-room').emit('new-message', {
    type: 'message',
    message: `New message from ${name}`,
    data: contactMessage,
    timestamp: new Date(),
  });

  res.status(201).json({
    success: true,
    data: contactMessage,
    message: 'Message sent successfully',
  });
});

// @desc    Mark message as read
// @route   PATCH /api/contact/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.isRead = true;
  await message.save();

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await Contact.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Contact message deleted successfully',
  });
});
