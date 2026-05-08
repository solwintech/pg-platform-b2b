const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const logActivity = require('../utils/logger');
const { sendOtpSms } = require('../utils/sms');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, alternatePhone, role, isMobileVerified } = req.body;

    // Check if mobile is verified
    if (!isMobileVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your mobile number first'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      alternatePhone,
      role,
      isMobileVerified: true,
      profileImage: ''
    });

    sendTokenResponse(user, 201, res);
    
    // Log registration
    logActivity({
      action: 'USER_REGISTER',
      performedBy: user._id,
      targetModel: 'User',
      targetId: user._id,
      details: `New user registered: ${email}`
    }, req);

  } catch (err) {
    let message = err.message;
    
    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different one.`;
    }

    res.status(400).json({ success: false, message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body; // email field here is used as a general 'identifier'

    // Validate identifier & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/phone and password' });
    }

    // Check if identifier is email or phone
    const isEmail = email.includes('@');
    const query = isEmail ? { email } : { phone: email };

    // Check for user
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if mobile is verified
    if (!user.isMobileVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mobile number not verified',
        needsVerification: true,
        mobile: user.phone
      });
    }

    sendTokenResponse(user, 200, res);
    
    // Log login
    logActivity({
      action: 'USER_LOGIN',
      performedBy: user._id,
      targetModel: 'User',
      targetId: user._id,
      details: `User logged in: ${email}`
    }, req);

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/details
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone,
      profileImage: req.body.profileImage
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update profile image
// @route   PUT /api/v1/auth/image
// @access  Private
exports.updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // File path for database (relative to public directory)
    const imagePath = `profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, {
      profileImage: imagePath
    }, {
      new: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Generate and send OTP
// @route   POST /api/v1/auth/generate-otp
// @access  Public
exports.generateOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const mobileWithPrefix = '+91' + mobile;

    // Log OTP for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${mobile}: ${otp}`);
    }

    // Check if user exists
    const user = await User.findOne({ phone: mobile });
    
    // If it's a login attempt, we don't care if they are verified, we just need to know they exist.
    // If you want to ONLY allow registered users to get a login OTP, we can add a check here.
    const isRegistration = !user;

    // Send OTP via SMS
    const smsSent = await sendOtpSms(mobileWithPrefix, otp);

    if (smsSent) {
      // Delete existing OTPs for this mobile
      await Otp.deleteMany({ mobile: mobileWithPrefix });

      // Store OTP in database with 10-minute expiry
      await Otp.create({
        mobile: mobileWithPrefix,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          mobile,
          expiresIn: 10
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
  } catch (err) {
    console.error('OTP Generation Error:', err);
    res.status(500).json({ success: false, message: 'Server error during OTP generation' });
  }
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both mobile number and OTP'
      });
    }

    const mobileWithPrefix = '+91' + mobile;

    // Find the latest valid OTP record
    const otpRecord = await Otp.findOne({
      mobile: mobileWithPrefix,
      otp,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (otpRecord) {
      // Check if user exists
      const user = await User.findOne({ phone: mobile });
      
      if (user) {
        // Update existing user verification status if needed
        if (!user.isMobileVerified) {
          user.isMobileVerified = true;
          await user.save();
        }

        // Generate token for passwordless login
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '30d'
        });

        // Delete the used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }

      // If user doesn't exist (it's a registration flow)
      await Otp.deleteOne({ _id: otpRecord._id });

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully. You can now complete your registration.',
        data: {
          mobileVerified: true,
          userExists: false,
          verifiedAt: new Date()
        }
      });
    } else {
      // Check if OTP exists but expired
      const expiredOtp = await Otp.findOne({
        mobile: mobileWithPrefix,
        otp,
        expiresAt: { $lte: new Date() }
      });

      if (expiredOtp) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
