import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      enum: [
        'wedding-photography',
        'wedding-videography',
        'corporate-coverage',
        'fashion-shoots',
        'brand-content',
        'events-coverage',
      ],
      required: [true, 'Service is required'],
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    package: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'custom'],
      required: [true, 'Package is required'],
    },
    personalDetails: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone is required'],
      },
      message: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    customAnswers: [
      {
        questionId: String,
        question: String,
        answer: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
