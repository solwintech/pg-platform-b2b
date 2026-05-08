const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const { sendOtpSms } = require('./utils/sms');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route files
const auth = require('./routes/auth');
const properties = require('./routes/properties');
const admin = require('./routes/admin');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/properties', properties);
app.use('/api/v1/admin', admin);

// Combined Public Test Endpoint
app.get('/check-status', async (req, res) => {
  try {
    const users = await User.find({}).select('name email role');
    res.status(200).json({
      success: true,
      message: 'Backend & Database are both working!',
      count: users.length,
      userList: users.map(u => u.name), // Just return names for quick check
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      message: 'Backend is working, but Database connection failed.',
      error: err.message
    });
  }
});


// DEBUG: Send Test OTP (Public)
app.get('/api/v1/debug/send-otp/:mobile', async (req, res) => {
  try {
    const mobile = req.params.mobile;
    const testOtp = '123456';
    const mobileWithPrefix = '+91' + mobile;

    const smsSent = await sendOtpSms(mobileWithPrefix, testOtp);

    if (smsSent) {
      res.status(200).json({ success: true, message: `OTP ${testOtp} sent to ${mobileWithPrefix}` });
    } else {
      res.status(500).json({ success: false, message: 'SMS API failed to send' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DEBUG: Seed Database (Public)
app.get('/api/v1/debug/seed-database', async (req, res) => {
  try {
    // Delete existing users
    await User.deleteMany();

    // Create Admin
    await User.create({
      name: 'System Admin',
      email: 'admin@sortifystays.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '0000000000',
      isMobileVerified: true,
      profileImage: ''
    });

    // Create Demo Owner
    await User.create({
      name: 'Rajesh B2B',
      email: 'rajesh@owner.com',
      password: 'password123',
      role: 'b2b',
      phone: '9876543210',
      isMobileVerified: true,
      profileImage: ''
    });

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully! You can now login with admin@staynest.com / adminpassword123'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Health Check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Export app for Vercel
module.exports = app;

// Only listen if not running as a serverless function
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Handle unhandled routes (404)
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found on this server`
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
});
