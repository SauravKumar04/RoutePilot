const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'All registration fields are mandatory');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'A user with this email already exists');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    user.password = undefined;

    return res.status(201).json(
      new ApiResponse(201, { user, token }, 'User registered successfully')
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password credentials');
    }

    const token = generateToken(user._id);
    user.password = undefined;

    return res.status(200).json(
      new ApiResponse(200, { user, token }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: missing protect middleware on this route.',
      });
    }

    const userId = req.user._id || req.user.id;
    const { currency, distanceUnit, averageFuelConsumption, fuelPrice } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'preferences.currency': currency,
          'preferences.distanceUnit': distanceUnit,
          'preferences.averageFuelConsumption': averageFuelConsumption,
          'preferences.fuelPrice': fuelPrice
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(
      new ApiResponse(200, { user: updatedUser }, 'Preferences updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, updatePreferences };