import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ['hero', 'about', 'services', 'contact', 'general'],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

export default SiteContent;
