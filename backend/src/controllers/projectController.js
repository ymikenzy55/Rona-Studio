import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import cloudinary from '../config/cloudinary.js';
import { io } from '../server.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: projects,
  });
});

// @desc    Get project by slug
// @route   GET /api/projects/:slug
// @access  Public
export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

// @desc    Get projects by category
// @route   GET /api/projects/category/:category
// @access  Public
export const getProjectsByCategory = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    categories: req.params.category,
  }).sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: projects,
  });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  try {
    const { title, description, category, client, date, featured, sections: sectionsJson } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      res.status(400);
      throw new Error('Title, description, and category are required');
    }

    // Get uploaded files
    const imageFiles = req.files?.images || [];

    if (imageFiles.length === 0) {
      res.status(400);
      throw new Error('At least one image is required');
    }

    // Upload images to Cloudinary
    const uploadPromises = imageFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'rona-studio/projects', resource_type: 'image' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Handle section media uploads
    const sectionFiles = req.files?.sectionMedia || [];
    let sections = [];
    if (sectionsJson) {
      try {
        sections = JSON.parse(sectionsJson);
      } catch (_) {
        sections = [];
      }
    }
    for (let i = 0; i < sectionFiles.length; i++) {
      const file = sectionFiles[i];
      const uploadResult = await new Promise((resolve, reject) => {
        const isVideo = file.mimetype.startsWith('video/');
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'rona-studio/sections', resource_type: isVideo ? 'video' : 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(file.buffer);
      });
      if (sections[i]) {
        sections[i].mediaUrl = uploadResult.secure_url;
        sections[i].mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      }
    }

    // Generate unique slug
    let slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    // Check if slug exists and make it unique
    let slugExists = await Project.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${slug}-${counter}`;
      slugExists = await Project.findOne({ slug });
      counter++;
    }

    // Create project
    const project = await Project.create({
      title,
      slug,
      description,
      category,
      client: client || '',
      date: date || null,
      featured: featured === 'true' || featured === true,
      images: imageUrls,
      sections,
    });

    // Notify all connected clients of new project
    io.emit('project-updated', { action: 'created', project });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500);
    throw error;
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const { title, description, category, client, date, featured, existingImages, sections: sectionsJson } = req.body;
  
  // Start with existing images if provided
  let imageUrls = [];
  if (existingImages) {
    imageUrls = Array.isArray(existingImages) ? existingImages : [existingImages];
  }

  // Upload new images if any
  const imageFiles = req.files?.images || [];
  if (imageFiles.length > 0) {
    const uploadPromises = imageFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'rona-studio/projects', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const newImageUrls = await Promise.all(uploadPromises);
    imageUrls = [...imageUrls, ...newImageUrls];
  }

  // Handle section media uploads for update
  const sectionFiles = req.files?.sectionMedia || [];
  let sections = [];
  if (sectionsJson) {
    try {
      sections = JSON.parse(sectionsJson);
    } catch (_) {
      sections = project.sections || [];
    }
  } else {
    sections = project.sections || [];
  }
  for (let i = 0; i < sectionFiles.length; i++) {
    const file = sectionFiles[i];
    const uploadResult = await new Promise((resolve, reject) => {
      const isVideo = file.mimetype.startsWith('video/');
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'rona-studio/sections', resource_type: isVideo ? 'video' : 'image' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(file.buffer);
    });
    if (sections[i]) {
      sections[i].mediaUrl = uploadResult.secure_url;
      sections[i].mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    }
  }

  // Update project
  const updateData = {
    title,
    description,
    category,
    client: client || '',
    date: date || null,
    featured: featured === 'true' || featured === true,
    images: imageUrls,
    sections,
  };

  project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  // Notify all connected clients of project update
  io.emit('project-updated', { action: 'updated', project });

  res.status(200).json({
    success: true,
    data: project,
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Note: Cloudinary deletion would require storing publicIds
  // For now, just delete the project document
  // TODO: Store publicIds and delete from Cloudinary

  await project.deleteOne();

  // Notify all connected clients of project deletion
  io.emit('project-updated', { action: 'deleted', projectId: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});
