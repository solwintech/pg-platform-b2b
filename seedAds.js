const mongoose = require('mongoose');
const Advertisement = require('./server/models/Advertisement');
const dotenv = require('dotenv');

dotenv.config();

const seedAds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/staynest');
    
    await Advertisement.deleteMany();

    const ads = [
      {
        title: 'Super Saver PG deals!',
        subtitle: 'Get up to 20% off on first month booking',
        imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
        link: '/listings',
        location: 'home_hero',
        status: 'active',
        priority: 1
      },
      {
        title: 'Safe & Secure Stays for Girls',
        subtitle: 'Verified properties with 24/7 security and home-like food',
        imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
        link: '/listings?gender=female',
        location: 'home_mid',
        status: 'active',
        priority: 2
      },
      {
        title: 'Premium Hostels in Bangalore',
        subtitle: 'Starting from ₹8,000/month',
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&q=80',
        link: '/listings?city=Bangalore',
        location: 'listing_sidebar',
        status: 'active',
        priority: 1
      },
      {
        title: 'Refer & Earn ₹500',
        subtitle: 'Invite your friends to StayNest and get cash rewards',
        imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&q=80',
        link: '/referral',
        location: 'property_sidebar',
        status: 'active',
        priority: 1
      }
    ];

    await Advertisement.insertMany(ads);
    console.log('Advertisements seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding ads:', err);
    process.exit(1);
  }
};

seedAds();
