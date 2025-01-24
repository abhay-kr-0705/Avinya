const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');

// Get all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .populate('photos')
      .sort({ created_at: -1 });
    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get gallery photos
router.get('/photos', async (req, res) => {
  try {
    const galleries = await Gallery.find().populate('photos');
    const photos = galleries.reduce((acc, gallery) => {
      return [...acc, ...gallery.photos.map(photo => ({
        ...photo.toObject(),
        gallery_id: gallery._id
      }))];
    }, []);
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new gallery
router.post('/', protect, async (req, res) => {
  const gallery = new Gallery({
    ...req.body,
    created_by: req.user.id
  });

  try {
    const newGallery = await gallery.save();
    res.status(201).json(newGallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a gallery
router.put('/:id', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (gallery.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(gallery, req.body);
    const updatedGallery = await gallery.save();
    res.json(updatedGallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a gallery
router.delete('/:id', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (gallery.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Gallery.deleteOne({ _id: req.params.id });
    res.json({ message: 'Gallery deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
