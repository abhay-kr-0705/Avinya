const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ created_at: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new gallery
router.post('/', protect, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.files.thumbnail) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    // Upload thumbnail to Cloudinary
    const thumbnailResult = await uploadToCloudinary(req.files.thumbnail[0]);

    // Upload photos to Cloudinary if any
    let photoResults = [];
    if (req.files.photos) {
      const uploadPromises = req.files.photos.map(file => uploadToCloudinary(file));
      photoResults = await Promise.all(uploadPromises);
    }

    // Create gallery with uploaded files
    const gallery = new Gallery({
      title,
      description,
      thumbnail: thumbnailResult.secure_url,
      thumbnail_public_id: thumbnailResult.public_id,
      photos: photoResults.map((result, index) => ({
        url: result.secure_url,
        public_id: result.public_id,
        order: index
      })),
      created_by: req.user._id
    });

    const savedGallery = await gallery.save();
    res.status(201).json(savedGallery);
  } catch (error) {
    console.error('Error creating gallery:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update gallery photos
router.put('/:id/photos', protect, upload.array('photos'), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    // Upload all photos to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await uploadToCloudinary(file);
        return {
          url: result.secure_url,
          public_id: result.public_id,
          order: gallery.photos.length
        };
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
      }
    });

    const uploadedPhotos = await Promise.all(uploadPromises);
    gallery.photos.push(...uploadedPhotos);
    await gallery.save();

    res.json(gallery);
  } catch (error) {
    console.error('Error updating gallery photos:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update gallery thumbnail
router.put('/:id/thumbnail', protect, upload.single('thumbnail'), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No thumbnail uploaded' });
    }

    // Upload new thumbnail to Cloudinary
    const result = await uploadToCloudinary(req.file);
    
    // Delete old thumbnail from Cloudinary if it exists
    if (gallery.thumbnail_public_id) {
      await cloudinary.uploader.destroy(gallery.thumbnail_public_id);
    }

    // Update gallery with new thumbnail
    gallery.thumbnail = result.secure_url;
    gallery.thumbnail_public_id = result.public_id;
    
    await gallery.save();
    res.json(gallery);
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete gallery
router.delete('/:id', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Delete all photos from Cloudinary
    const deletePromises = gallery.photos.map(photo => 
      photo.public_id ? cloudinary.uploader.destroy(photo.public_id) : Promise.resolve()
    );

    // Delete thumbnail from Cloudinary
    if (gallery.thumbnail_public_id) {
      deletePromises.push(cloudinary.uploader.destroy(gallery.thumbnail_public_id));
    }

    await Promise.all(deletePromises);
    await gallery.remove();

    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove photo from gallery
router.delete('/:id/photos/:photoId', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const photoIndex = gallery.photos.findIndex(
      photo => photo._id.toString() === req.params.photoId
    );

    if (photoIndex === -1) {
      return res.status(404).json({ message: 'Photo not found in gallery' });
    }

    // Get the photo to delete
    const photoToDelete = gallery.photos[photoIndex];

    // Remove the photo from cloudinary
    if (photoToDelete.public_id) {
      await cloudinary.uploader.destroy(photoToDelete.public_id);
    }

    // Remove the photo from the gallery
    gallery.photos.splice(photoIndex, 1);
    await gallery.save();

    res.json(gallery);
  } catch (error) {
    console.error('Error removing photo:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
