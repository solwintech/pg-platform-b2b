const express = require('express');
const router = express.Router();
const { register, login, getMe, generateOtp, verifyOtp } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/generate-otp', generateOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);

module.exports = router;
