const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { authenticateToken } = require('../middleware/auth');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new resource
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, type, domain, url, description, created_by } = req.body;
    const resource = new Resource({
      title,
      type,
      domain,
      url,
      description,
      created_by
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update resource
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, domain, url, description } = req.body;
    
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.title = title;
    resource.type = type;
    resource.domain = domain;
    resource.url = url;
    resource.description = description;

    await resource.save();
    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete resource
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
