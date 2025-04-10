import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  registration_no: {
    type: String,
    required: [true, 'Please provide a registration number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  branch: {
    type: String,
    required: [true, 'Please provide a branch'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Please provide a semester'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
    trim: true,
    validate: {
      validator: function(v) {
        // Remove any non-digit characters (including +)
        const digits = v.replace(/\D/g, '');
        // Check if the remaining digits form a valid mobile number
        // For Indian numbers: either 10 digits, or 11-12 digits starting with country code
        return /^(\d{10}|\d{11,12})$/.test(digits);
      },
      message: 'Please enter a valid mobile number'
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'superadmin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at timestamp before saving
userSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    throw new Error('Error comparing passwords');
  }
};

const User = mongoose.model('User', userSchema);

export default User;
