import asyncHandler from 'express-async-handler';
import BookingConfig from '../models/BookingConfig.js';

// Default services and packages
const defaultServices = [
  { id: '1', value: 'wedding-photography', label: 'Wedding Photography', order: 0 },
  { id: '2', value: 'wedding-videography', label: 'Wedding Videography', order: 1 },
  { id: '3', value: 'corporate-coverage', label: 'Corporate Coverage', order: 2 },
  { id: '4', value: 'fashion-shoots', label: 'Fashion Shoots', order: 3 },
  { id: '5', value: 'brand-content', label: 'Brand Content', order: 4 },
  { id: '6', value: 'events-coverage', label: 'Events Coverage', order: 5 },
];

const defaultPackages = [
  { id: '1', value: 'basic', label: 'Basic', description: '4 hours coverage', order: 0 },
  { id: '2', value: 'standard', label: 'Standard', description: '8 hours coverage', order: 1 },
  { id: '3', value: 'premium', label: 'Premium', description: 'Full day coverage', order: 2 },
  { id: '4', value: 'custom', label: 'Custom', description: 'Tailored to your needs', order: 3 },
];

// @desc    Get booking config (services, packages, questions)
// @route   GET /api/booking-config
// @access  Public
export const getBookingConfig = asyncHandler(async (req, res) => {
  let config = await BookingConfig.findOne();
  if (!config) {
    config = await BookingConfig.create({
      services: defaultServices,
      packages: defaultPackages,
      questions: [],
      allowCustomService: true,
      allowCustomPackage: true,
    });
  }
  res.json({ success: true, data: config });
});

// @desc    Save booking config (services, packages, questions)
// @route   PUT /api/booking-config
// @access  Private/Admin
export const saveBookingConfig = asyncHandler(async (req, res) => {
  const { services, packages, questions, allowCustomService, allowCustomPackage } = req.body;

  let config = await BookingConfig.findOne();
  if (config) {
    if (services !== undefined) config.services = services;
    if (packages !== undefined) config.packages = packages;
    if (questions !== undefined) config.questions = questions;
    if (allowCustomService !== undefined) config.allowCustomService = allowCustomService;
    if (allowCustomPackage !== undefined) config.allowCustomPackage = allowCustomPackage;
    await config.save();
  } else {
    config = await BookingConfig.create({
      services: services || defaultServices,
      packages: packages || defaultPackages,
      questions: questions || [],
      allowCustomService: allowCustomService !== undefined ? allowCustomService : true,
      allowCustomPackage: allowCustomPackage !== undefined ? allowCustomPackage : true,
    });
  }

  res.json({ success: true, data: config });
});
