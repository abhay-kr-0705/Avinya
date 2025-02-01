const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../utils/cloudinary');

// Get all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ created_at: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single gallery
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.json(gallery);
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

    if (!req.files?.thumbnail) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    const gallery = new Gallery({
      title,
      description,
      thumbnail: req.files.thumbnail[0].path,
      photos: req.files?.photos?.map(file => ({
        url: file.path,
        public_id: file.filename
      })) || [],
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
router.put('/:id/photos', protect, upload.array('photos', 10), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    // Add new photos to the gallery's photos array
    const newPhotos = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    gallery.photos.push(...newPhotos);
    const updatedGallery = await gallery.save();
    res.json(updatedGallery);
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

    // Delete old thumbnail from Cloudinary if it exists
    if (gallery.thumbnail_public_id) {
      await cloudinary.uploader.destroy(gallery.thumbnail_public_id);
    }

    // Update gallery with new thumbnail
    gallery.thumbnail = req.file.path;
    gallery.thumbnail_public_id = req.file.filename;

    const updatedGallery = await gallery.save();
    res.json(updatedGallery);
  } catch (error) {
    console.error('Error updating gallery thumbnail:', error);
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

    // Wait for all Cloudinary deletions to complete
    await Promise.all(deletePromises);

    // Delete the gallery document
    await gallery.deleteOne();

    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
