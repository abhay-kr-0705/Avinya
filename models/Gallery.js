const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    default: null
  },
  caption: String,
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  thumbnail_public_id: {
    type: String,
    default: null
  },
  description: String,
  photos: [photoSchema],
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Pre-save middleware to ensure photos have public_id if not set
gallerySchema.pre('save', function(next) {
  // Set default public_id for photos if not set
  if (this.photos) {
    this.photos.forEach(photo => {
      if (!photo.public_id) {
        // Extract public_id from URL or set a default value
        const urlParts = photo.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        photo.public_id = `genx_gallery/${filename.split('.')[0]}`;
      }
    });
  }

  // Set default thumbnail_public_id if not set
  if (this.thumbnail && !this.thumbnail_public_id) {
    const urlParts = this.thumbnail.split('/');
    const filename = urlParts[urlParts.length - 1];
    this.thumbnail_public_id = `genx_gallery/${filename.split('.')[0]}`;
  }

  next();
});

module.exports = mongoose.model('Gallery', gallerySchema);
