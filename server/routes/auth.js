const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  generateOtp, 
  verifyOtp,
  updateDetails,
  updateProfileImage,
  updatePassword,
  checkMobile
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/generate-otp', generateOtp);
router.post('/verify-otp', verifyOtp);
router.post('/check-mobile', checkMobile);

// Protected routes
router.get('/me', protect, getMe);
router.put('/details', protect, updateDetails);
router.put('/image', protect, upload.single('image'), updateProfileImage);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
