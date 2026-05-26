import asyncHandler from 'express-async-handler';
import SiteContent from '../models/SiteContent.js';
import { io } from '../server.js';

// @desc    Get all site content
// @route   GET /api/site-content
// @access  Public
export const getAllContent = asyncHandler(async (req, res) => {
  const content = await SiteContent.find();
  
  // Convert array to object with section as key
  const contentObj = {};
  content.forEach(item => {
    contentObj[item.section] = item.content;
  });

  res.json({
    success: true,
    data: contentObj,
  });
});

// @desc    Get content by section
// @route   GET /api/site-content/:section
// @access  Public
export const getContentBySection = asyncHandler(async (req, res) => {
  const content = await SiteContent.findOne({ section: req.params.section });

  if (!content) {
    res.status(404);
    throw new Error('Content not found');
  }

  res.json({
    success: true,
    data: content,
  });
});

// @desc    Update site content
// @route   PUT /api/site-content/:section
// @access  Private/Admin
export const updateContent = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const { content } = req.body;

  let siteContent = await SiteContent.findOne({ section });

  if (siteContent) {
    siteContent.content = content;
    await siteContent.save();
  } else {
    siteContent = await SiteContent.create({
      section,
      content,
    });
  }

  // Notify all connected clients of content update
  io.emit('content-updated', { section });

  res.json({
    success: true,
    data: siteContent,
  });
});

// @desc    Initialize default content
// @route   POST /api/site-content/init
// @access  Private/Admin
export const initializeContent = asyncHandler(async (req, res) => {
  const defaultContent = [
    {
      section: 'hero',
      content: {
        title: 'Capturing Timeless Moments',
        subtitle: 'Premium photography and videography services for your most precious memories',
        buttonText: 'Book an Appointment',
        buttonLink: '#contact',
      },
    },
    {
      section: 'about',
      content: {
        badge: 'ABOUT US',
        title: 'Crafting Visual Stories Since 2014',
        description: 'We are a team of passionate photographers and videographers dedicated to capturing life\'s most precious moments with elegance and artistry.',
        stats: [
          { value: '500+', label: 'Projects' },
          { value: '300+', label: 'Clients' },
          { value: '15+', label: 'Awards' },
          { value: '10+', label: 'Years' },
        ],
        story: {
          title: 'Our Story',
          paragraphs: [
            'With over a decade of experience, we\'ve had the privilege of documenting countless weddings, corporate events, fashion shoots, and special occasions.',
            'Our approach combines technical excellence with creative vision to deliver stunning visual stories that you\'ll treasure forever.',
            'Every project is unique, and we take the time to understand your vision, ensuring that every shot reflects your personality and style.',
          ],
        },
        values: [
          {
            title: 'Precision',
            description: 'Every shot is carefully composed with technical excellence',
          },
          {
            title: 'Passion',
            description: 'We love what we do and it shows in every frame',
          },
          {
            title: 'Innovation',
            description: 'Cutting-edge techniques meet timeless artistry',
          },
        ],
        quote: 'We don\'t just take photos, we create timeless memories that tell your unique story.',
      },
    },
    {
      section: 'services',
      content: {
        badge: 'WHAT WE OFFER',
        title: 'Extraordinary Services For Every Occasion',
        description: 'We offer a comprehensive range of photography and videography services tailored to your unique needs and vision.',
        services: [
          {
            number: '01',
            title: 'Wedding Photography',
            description: 'Capture every precious moment of your special day with our elegant wedding photography services.',
          },
          {
            number: '02',
            title: 'Wedding Videography',
            description: 'Cinematic wedding films that tell your unique love story in the most beautiful way.',
          },
          {
            number: '03',
            title: 'Corporate Coverage',
            description: 'Professional photography and videography for corporate events, conferences, and brand content.',
          },
          {
            number: '04',
            title: 'Fashion Shoots',
            description: 'High-end fashion photography that showcases style, elegance, and creativity.',
          },
          {
            number: '05',
            title: 'Brand Content',
            description: 'Create stunning visual content that elevates your brand and engages your audience.',
          },
          {
            number: '06',
            title: 'Events Coverage',
            description: 'Comprehensive coverage of your special events, from intimate gatherings to large celebrations.',
          },
        ],
        ctaText: 'Can\'t find what you\'re looking for?',
        ctaButton: 'Let\'s Talk About Your Project',
      },
    },
    {
      section: 'contact',
      content: {
        badge: 'GET IN TOUCH',
        title: 'Let\'s Create Something Amazing Together',
        description: 'Ready to start your project? We\'d love to hear from you.',
        contactInfo: [
          {
            type: 'phone',
            label: 'Phone',
            value: '+233 123 456 789',
            link: 'tel:+233123456789',
          },
          {
            type: 'email',
            label: 'Email',
            value: 'hello@ronastudio.com',
            link: 'mailto:hello@ronastudio.com',
          },
          {
            type: 'location',
            label: 'Location',
            value: '123 Studio Street, Accra',
            link: 'https://maps.google.com',
          },
          {
            type: 'hours',
            label: 'Hours',
            value: 'Mon-Fri: 9AM-6PM',
            link: null,
          },
        ],
        socialLinks: [
          { platform: 'Instagram', url: 'https://instagram.com' },
          { platform: 'Facebook', url: 'https://facebook.com' },
          { platform: 'Twitter', url: 'https://twitter.com' },
          { platform: 'Dribbble', url: 'https://dribbble.com' },
        ],
        mapAddress: {
          street: '123 Studio Street',
          area: 'Creative District',
          city: 'Accra, Ghana',
        },
      },
    },
    {
      section: 'general',
      content: {
        siteName: 'Rona Studio',
        tagline: 'Capturing Timeless Moments',
        logo: '/logo.png',
        copyrightText: '© 2024 Rona Studio. All rights reserved.',
      },
    },
  ];

  // Check if content already exists
  const existingContent = await SiteContent.countDocuments();
  
  if (existingContent > 0) {
    res.status(400);
    throw new Error('Content already initialized');
  }

  await SiteContent.insertMany(defaultContent);

  res.json({
    success: true,
    message: 'Default content initialized successfully',
  });
});
