const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'URL is required'
    }
  },
  public_id: {
    type: String,
    required: function() {
      // Only require public_id for new photos (those created after this update)
      return this.isNew;
    },
    default: function() {
      // Generate a public_id from the URL if one isn't provided
      if (this.url) {
        const urlParts = this.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        return `genx_gallery/${filename.split('.')[0]}`;
      }
      return null;
    }
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
    required: function() {
      // Only require thumbnail_public_id for new galleries
      return this.isNew;
    },
    default: function() {
      // Generate a public_id from the thumbnail URL if one isn't provided
      if (this.thumbnail) {
        const urlParts = this.thumbnail.split('/');
        const filename = urlParts[urlParts.length - 1];
        return `genx_gallery/${filename.split('.')[0]}`;
      }
      return null;
    }
  },
  description: String,
  photos: {
    type: [photoSchema],
    default: []
  },
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

// Pre-save middleware to handle existing documents
gallerySchema.pre('save', function(next) {
  // If this is an existing document
  if (!this.isNew) {
    // Handle photos
    if (this.photos) {
      this.photos.forEach(photo => {
        if (!photo.public_id && photo.url) {
          const urlParts = photo.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          photo.public_id = `genx_gallery/${filename.split('.')[0]}`;
        }
      });
    }

    // Handle thumbnail
    if (!this.thumbnail_public_id && this.thumbnail) {
      const urlParts = this.thumbnail.split('/');
      const filename = urlParts[urlParts.length - 1];
      this.thumbnail_public_id = `genx_gallery/${filename.split('.')[0]}`;
    }
  }

  next();
});

// Add this to handle updates
gallerySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.photos) {
    update.photos.forEach(photo => {
      if (!photo.public_id && photo.url) {
        const urlParts = photo.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        photo.public_id = `genx_gallery/${filename.split('.')[0]}`;
      }
    });
  }
  next();
});

module.exports = mongoose.model('Gallery', gallerySchema);
