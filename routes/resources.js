const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect } = require('../middleware/auth');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ created_at: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, url, type, domain } = req.body;

    const resource = await Resource.create({
      title,
      description,
      url,
      type,
      domain,
      uploaded_by: req.user.id
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
  }
});

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, url, type, domain } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Make sure user owns resource
    if (resource.uploaded_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this resource' });
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { title, description, url, type, domain },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedResource });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
  }
});

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Make sure user owns resource
    if (resource.uploaded_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    await resource.remove();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;
