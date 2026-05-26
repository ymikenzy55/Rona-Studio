import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking.js';
import { sendBookingEmail } from '../services/emailService.js';
import { io } from '../server.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: bookings,
  });
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
  const { service, preferredDate, package: packageType, fullName, email, phone, message, customAnswers } = req.body;

  console.log('Booking request body:', JSON.stringify({ service, preferredDate, package: packageType, fullName, email, phone }));

  // Validate required fields
  const missing = [];
  if (!service) missing.push('service');
  if (!preferredDate) missing.push('preferredDate');
  if (!packageType) missing.push('package');
  if (!fullName) missing.push('fullName');
  if (!email) missing.push('email');
  if (!phone) missing.push('phone');

  if (missing.length > 0) {
    res.status(400);
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Create booking (retry once on transient network errors like ECONNRESET)
  const bookingData = {
    service,
    preferredDate,
    package: packageType,
    personalDetails: { fullName, email, phone, message },
    customAnswers: Array.isArray(customAnswers) ? customAnswers : [],
  };

  let booking;
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      booking = await Booking.create(bookingData);
      break;
    } catch (err) {
      lastError = err;
      if (attempt < 2 && (err.code === 'ECONNRESET' || err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError')) {
        console.warn(`Booking DB error on attempt ${attempt}, retrying...`);
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        throw err;
      }
    }
  }

  // Send email notification
  try {
    await sendBookingEmail(booking);
  } catch (error) {
    console.error('Email sending failed:', error);
  }

  // Emit WebSocket notification to admin (slight delay lets reconnecting sockets rejoin)
  setTimeout(() => {
    console.log('Emitting new-booking to admin-room');
    io.to('admin-room').emit('new-booking', {
      type: 'booking',
      message: `New booking from ${fullName}`,
      data: booking,
      timestamp: new Date(),
    });
  }, 800);

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Booking created successfully',
  });
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.status = status;
  await booking.save();

  // Notify all connected clients of booking status change
  io.emit('booking-status-changed', {
    bookingId: booking._id,
    status,
    clientName: booking.personalDetails?.fullName,
  });

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await booking.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Booking deleted successfully',
  });
});
