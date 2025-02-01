const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect } = require('../../middleware/auth');

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ created_at: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new resource
router.post('/', protect, async (req, res) => {
  const resource = new Resource({
    ...req.body,
    uploaded_by: req.user.id
  });

  try {
    const newResource = await resource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a resource
router.put('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.uploaded_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(resource, req.body);
    const updatedResource = await resource.save();
    res.json(updatedResource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a resource
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.uploaded_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Resource.deleteOne({ _id: req.params.id });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
