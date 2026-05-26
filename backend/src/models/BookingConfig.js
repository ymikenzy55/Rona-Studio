import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'textarea', 'select', 'radio'], default: 'text' },
  options: [{ type: String, trim: true }],
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
});

const packageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  order: { type: Number, default: 0 },
});

const bookingConfigSchema = new mongoose.Schema(
  {
    services: [serviceSchema],
    packages: [packageSchema],
    questions: [questionSchema],
    allowCustomService: { type: Boolean, default: true },
    allowCustomPackage: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BookingConfig = mongoose.model('BookingConfig', bookingConfigSchema);

export default BookingConfig;
