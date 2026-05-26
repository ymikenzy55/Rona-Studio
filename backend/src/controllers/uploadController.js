import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload a single image to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'rona-studio/content', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(req.file.buffer);
  });

  res.status(200).json({
    success: true,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });
});
