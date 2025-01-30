const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  registration_no: {
    type: String,
    required: [true, 'Please provide your registration number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  branch: {
    type: String,
    required: [true, 'Please provide your branch'],
    trim: true,
    enum: ['CSE', 'EEE', 'ECE (VLSI)', 'Mechanical', 'Civil', 'Mining']
  },
  semester: {
    type: String,
    required: [true, 'Please provide your semester'],
    trim: true,
    enum: ['1', '2', '3', '4', '5', '6', '7', '8']
  },
  mobile: {
    type: String,
    required: [true, 'Please provide your mobile number'],
    trim: true,
    validate: {
      validator: function(v) {
        // Allow country code (+91, +1, +44, etc.) followed by 10 digits
        return /^\+\d{1,4}\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number! Format should be +[country code][10 digits]`
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
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

module.exports = mongoose.model('User', userSchema);
