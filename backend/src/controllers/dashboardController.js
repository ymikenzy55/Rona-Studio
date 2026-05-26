import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Booking from '../models/Booking.js';
import Contact from '../models/Contact.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const totalProjects = await Project.countDocuments();
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const totalMessages = await Contact.countDocuments();
  const unreadMessages = await Contact.countDocuments({ read: false });

  // Get recent bookings
  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5);

  // Get recent messages
  const recentMessages = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      totalBookings,
      pendingBookings,
      totalMessages,
      unreadMessages,
      recentBookings,
      recentMessages,
    },
  });
});
