import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    client: String,
    date: Date,
    sections: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        mediaUrl: { type: String, default: '' },
        mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
        order: { type: Number, default: 0 },
      },
    ],
    images: [{
      type: String, // Simple URL strings
    }],
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving (only if not provided)
projectSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
