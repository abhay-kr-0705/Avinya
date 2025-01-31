const express = require('express');
const router = express.Router();
const Gallery = require('../models/gallery');
const { uploadToCloudinary } = require('../utils/cloudinary');
const auth = require('../middleware/auth');

// Get all galleries
router.get('/galleries', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleries);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single gallery
router.get('/galleries/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.json(gallery);
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create gallery
router.post('/galleries', auth, async (req, res) => {
  try {
    const { title, description, thumbnail, photos } = req.body;
    
    const gallery = new Gallery({
      title,
      description,
      thumbnail,
      photos,
      created_by: req.user._id
    });

    await gallery.save();
    res.status(201).json(gallery);
  } catch (error) {
    console.error('Error creating gallery:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update gallery
router.put('/galleries/:id', auth, async (req, res) => {
  try {
    const { title, description, thumbnail, photos } = req.body;
    
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    gallery.title = title;
    gallery.description = description;
    gallery.thumbnail = thumbnail;
    gallery.photos = photos;

    await gallery.save();
    res.json(gallery);
  } catch (error) {
    console.error('Error updating gallery:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete gallery
router.delete('/galleries/:id', auth, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    await gallery.remove();
    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
