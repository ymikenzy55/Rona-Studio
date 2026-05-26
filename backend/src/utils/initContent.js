import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/database.js';
import SiteContent from '../models/SiteContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '../../.env') });

const initializeContent = async () => {
  try {
    await connectDB();

    // Check if content already exists
    const existingContent = await SiteContent.countDocuments();
    
    if (existingContent > 0) {
      console.log('Content already initialized');
      process.exit(0);
    }

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
          copyrightText: '© 2024 Rona Studio. All rights reserved.',
        },
      },
    ];

    await SiteContent.insertMany(defaultContent);

    console.log('✅ Default site content initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing content:', error);
    process.exit(1);
  }
};

initializeContent();
