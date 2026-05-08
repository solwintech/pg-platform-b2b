const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sortify_stays');
    
    console.log('Clearing existing users...');
    await User.deleteMany();

    console.log('Seeding admin user...');
    await User.create({
      name: 'System Admin',
      email: 'admin@sortifystays.com',
      password: 'adminpassword123',
      role: 'admin',
      phone: '0000000000',
      isMobileVerified: true,
      profileImage: ''
    });

    console.log('Seeding demo B2B user...');
    await User.create({
      name: 'Rajesh B2B',
      email: 'rajesh@owner.com',
      password: 'password123',
      role: 'b2b',
      phone: '9876543210',
      isMobileVerified: true,
      profileImage: ''
    });

    console.log('Seeding successful!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
