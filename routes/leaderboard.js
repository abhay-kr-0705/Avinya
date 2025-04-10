const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const LeaderboardEntry = require('../models/LeaderboardEntry');

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  });

// Protect all leaderboard routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Get all leaderboard entries
router.get('/', asyncHandler(async (req, res) => {
  const entries = await LeaderboardEntry.find().sort({ points: -1 });
  res.json({
    success: true,
    count: entries.length,
    data: entries
  });
}));

// Get single leaderboard entry
router.get('/:id', asyncHandler(async (req, res) => {
  const entry = await LeaderboardEntry.findById(req.params.id);
  
  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Leaderboard entry not found'
    });
  }

  res.json({
    success: true,
    data: entry
  });
}));

// Create new leaderboard entry
router.post('/', asyncHandler(async (req, res) => {
  const entry = await LeaderboardEntry.create(req.body);
  res.status(201).json({
    success: true,
    data: entry
  });
}));

// Update leaderboard entry
router.put('/:id', asyncHandler(async (req, res) => {
  const entry = await LeaderboardEntry.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Leaderboard entry not found'
    });
  }

  res.json({
    success: true,
    data: entry
  });
}));

// Delete leaderboard entry
router.delete('/:id', asyncHandler(async (req, res) => {
  const entry = await LeaderboardEntry.findByIdAndDelete(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Leaderboard entry not found'
    });
  }

  res.json({
    success: true,
    data: {}
  });
}));

module.exports = router; 