const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Prevents password from being returned in queries by default
    },
    preferences: {
      currency: { type: String, default: 'USD' },
      distanceUnit: { type: String, enum: ['km', 'mi'], default: 'km' },
      averageFuelConsumption: { type: Number, default: 15 }, // km per liter
      fuelPrice: { type: Number, default: 1.5 }, // per liter
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password validity
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);