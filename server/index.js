const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
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
const admin = require('./routes/admin');
const properties = require('./routes/properties');
const advertisements = require('./routes/advertisements');
const leads = require('./routes/leads');
const reviews = require('./routes/reviews');
const settings = require('./routes/settings');
const notifications = require('./routes/notifications');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/admin', admin);
app.use('/api/v1/properties', properties);
app.use('/api/v1/advertisements', advertisements);
app.use('/api/v1/leads', leads);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/settings', settings);
app.use('/api/v1/notifications', notifications);

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

const server = http.createServer(app);

// SSE Event Hub
const sseClients = new Map(); // userId -> response object

app.get('/api/v1/events/stream', (req, res) => {
  const userId = req.query.userId;
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send an initial connected event
  res.write(`data: ${JSON.stringify({ event: 'connected' })}\n\n`);

  if (userId && userId !== 'null') {
    sseClients.set(userId, res);
  }

  // Add generic client map for broadcast
  const clientId = Date.now().toString();
  if (!userId || userId === 'null') {
    sseClients.set(`guest_${clientId}`, res);
  }

  req.on('close', () => {
    if (userId && userId !== 'null') {
      sseClients.delete(userId);
    } else {
      sseClients.delete(`guest_${clientId}`);
    }
  });
});

app.set('sseClients', sseClients);

// Handle unhandled routes (404)
app.use((req, res) => {
  // Suppress socket.io 404 logs from spamming the console
  if (!req.url.startsWith('/socket.io')) {
    console.log(`404 Not Found: ${req.method} ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found on this server`
  });
});

// Start the server
if (typeof PhusionPassenger !== 'undefined') {
  // Phusion Passenger (Hostinger / cPanel)
  server.listen('passenger');
} else if (require.main === module) {
  // Direct Node.js execution
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`);
});

// Export server for Hostinger Passenger / Vercel
module.exports = server;

