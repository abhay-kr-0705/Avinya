const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary, cloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find()
      .sort({ created_at: -1 });
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

// Create gallery
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, thumbnail, photos, created_by } = req.body;
    
    const gallery = new Gallery({
      title,
      description,
      thumbnail,
      photos,
      created_by
    });

    const savedGallery = await gallery.save();
    res.status(201).json(savedGallery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload image
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.path);
    fs.unlinkSync(req.file.path);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
});

// Update gallery photos
router.put('/:id/photos', protect, upload.array('photos'), async (req, res) => {
  const uploadedFiles = [];
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        console.log('Uploading file:', file.path);
        uploadedFiles.push(file.path);
        
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'genx_gallery',
          resource_type: 'auto'
        });
        
        console.log('Cloudinary upload result:', result);
        
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
    console.log('All photos uploaded:', uploadedPhotos);

    // Add new photos to the gallery
    gallery.photos.push(...uploadedPhotos);
    
    // Save the gallery
    const savedGallery = await gallery.save();
    console.log('Gallery saved successfully');

    // Clean up uploaded files
    uploadedFiles.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
    });

    res.json(savedGallery);
  } catch (error) {
    console.error('Error in photo upload:', error);
    
    // Clean up uploaded files on error
    uploadedFiles.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }
    });

    res.status(500).json({ 
      message: error.message,
      details: error.stack 
    });
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

// Update gallery thumbnail
router.put('/:id/thumbnail', protect, upload.single('thumbnail'), async (req, res) => {
  let uploadedFile = null;
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No thumbnail uploaded' });
    }

    uploadedFile = req.file.path;
    console.log('Uploading thumbnail:', uploadedFile);

    const result = await cloudinary.uploader.upload(uploadedFile, {
      folder: 'genx_gallery',
      resource_type: 'auto'
    });
    
    console.log('Cloudinary upload result:', result);

    // Delete old thumbnail from Cloudinary if it exists
    if (gallery.thumbnail_public_id) {
      try {
        await cloudinary.uploader.destroy(gallery.thumbnail_public_id);
        console.log('Old thumbnail deleted from Cloudinary');
      } catch (error) {
        console.error('Error deleting old thumbnail:', error);
      }
    }

    // Update gallery with new thumbnail
    gallery.thumbnail = result.secure_url;
    gallery.thumbnail_public_id = result.public_id;

    // Save the gallery
    const savedGallery = await gallery.save();
    console.log('Gallery saved with new thumbnail');

    // Clean up uploaded file
    if (fs.existsSync(uploadedFile)) {
      fs.unlinkSync(uploadedFile);
    }

    res.json(savedGallery);
  } catch (error) {
    console.error('Error in thumbnail upload:', error);
    
    // Clean up uploaded file on error
    if (uploadedFile && fs.existsSync(uploadedFile)) {
      fs.unlinkSync(uploadedFile);
    }

    res.status(500).json({ 
      message: error.message,
      details: error.stack 
    });
  }
});

// Delete gallery with confirmation
router.delete('/:id', protect, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Delete all photos
    for (const photo of gallery.photos) {
      try {
        await fs.unlink(photo.url);
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }

    // Delete thumbnail
    if (gallery.thumbnail) {
      try {
        await fs.unlink(gallery.thumbnail);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }

    await gallery.remove();
    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
