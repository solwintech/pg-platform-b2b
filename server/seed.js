const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Property = require('./models/Property');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sortify_stays');
    
    console.log('Clearing existing users...');
    try {
      await User.collection.drop();
      console.log('User collection dropped successfully.');
    } catch (err) {
      console.log('User collection drop returned:', err.message);
      await User.deleteMany();
    }

    console.log('Clearing existing properties...');
    try {
      await Property.collection.drop();
      console.log('Property collection dropped successfully.');
    } catch (err) {
      console.log('Property collection drop returned:', err.message);
      await Property.deleteMany();
    }

    // Sync current indexes defined in schema
    try {
      await User.syncIndexes();
      console.log('User indexes synchronized successfully.');
    } catch (e) {
      console.error('Error synchronizing User indexes:', e.message);
    }

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

    console.log('Seeding demo B2B users...');
    const b2bUser = await User.create({
      name: 'Rajesh B2B',
      email: 'rajesh@owner.com',
      password: 'password123',
      role: 'b2b',
      phone: '9876543210',
      isMobileVerified: true,
      profileImage: ''
    });

    const b2bUser2 = await User.create({
      name: 'Vikram B2B',
      email: 'vikram@owner.com',
      password: 'password123',
      role: 'b2b',
      phone: '9876543211',
      isMobileVerified: true,
      profileImage: ''
    });

    const b2bUserId = b2bUser._id;
    const b2bUserId2 = b2bUser2._id;

    console.log('Seeding properties...');
    const propertiesData = [
      {
        owner: b2bUserId,
        pgName: "Sunrise PG for Boys",
        propertyType: "PG",
        genderAllowed: "Boys",
        isPublished: true,
        isFeatured: true,
        status: "approved",
        managerName: "Arjun Rao",
        managerPhone: "9999900001",
        managerEmail: "arjun@example.com",
        postedBy: "Owner",
        postedByName: "Rajesh B2B",
        address: "Plot 12, Near Chetak Bridge",
        area: "MP Nagar Zone 1",
        city: "Bhopal",
        pinCode: "462011",
        latitude: 23.2325,
        longitude: 77.4328,
        totalBeds: 40,
        totalRooms: 20,
        amenities: ["WiFi", "AC", "Laundry", "Meals", "Security"],
        roomTypes: [
          { name: "Single AC", type: "single", price: 12000, capacity: "1 person", attachedBathroom: true, balcony: true },
          { name: "Double Sharing", type: "double", price: 8500, capacity: "2 persons", attachedBathroom: true, balcony: false }
        ],
        nearbyPlaces: [
          { name: "DB Mall", distance: "0.5" },
          { name: "MP Nagar Metro Station", distance: "1.2" }
        ],
        coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        galleryImages: [
          { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80" },
          { url: "https://images.unsplash.com/photo-1502672260266-1c1ea5250839?w=800&q=80" }
        ],
        visitingHours: {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          startTime: "09:00",
          endTime: "19:00"
        }
      },
      {
        owner: b2bUserId,
        pgName: "Blossom Girls PG",
        propertyType: "PG",
        genderAllowed: "Girls",
        isPublished: true,
        isFeatured: false,
        status: "approved",
        managerName: "Priya Sharma",
        managerPhone: "9999900002",
        managerEmail: "priya@example.com",
        postedBy: "Owner",
        postedByName: "Rajesh B2B",
        address: "E-7, Near Bittan Market",
        area: "Arera Colony",
        city: "Bhopal",
        pinCode: "462016",
        latitude: 23.2125,
        longitude: 77.4215,
        totalBeds: 30,
        totalRooms: 15,
        amenities: ["WiFi", "Geyser", "Laundry", "Meals", "Security Guard"],
        roomTypes: [
          { name: "Single Non-AC", type: "single", price: 15000, capacity: "1 person", attachedBathroom: true, balcony: false },
          { name: "Triple Sharing", type: "double", price: 7000, capacity: "3 persons", attachedBathroom: false, balcony: true }
        ],
        nearbyPlaces: [
          { name: "Bittan Market", distance: "0.3" },
          { name: "National Hospital", distance: "0.8" }
        ],
        coverImage: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?w=800&q=80",
        galleryImages: [
          { url: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?w=800&q=80" }
        ],
        visitingHours: {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          startTime: "09:00",
          endTime: "18:00"
        }
      },
      {
        owner: b2bUserId,
        pgName: "Urban Nest Service Apartment",
        propertyType: "Service Apartment",
        genderAllowed: "Unisex",
        isPublished: true,
        isFeatured: true,
        status: "approved",
        managerName: "Vikram Malhotra",
        managerPhone: "9999900003",
        managerEmail: "vikram@urbannest.com",
        postedBy: "Owner",
        postedByName: "Rajesh B2B",
        address: "Near Trilanga",
        area: "Gulmohar Colony",
        city: "Bhopal",
        pinCode: "462039",
        latitude: 23.1945,
        longitude: 77.4398,
        totalBeds: 30,
        totalRooms: 30,
        amenities: ["WiFi", "AC", "Housekeeping", "Parking", "Lift"],
        roomTypes: [
          { name: "Private Studio", type: "single", price: 25000, capacity: "1 person", attachedBathroom: true, balcony: true }
        ],
        nearbyPlaces: [
          { name: "Aura Mall", distance: "1.0" },
          { name: "Shahpura Lake", distance: "2.0" }
        ],
        coverImage: "https://images.unsplash.com/photo-1598928506311-c55dd1b31bb1?w=800&q=80",
        galleryImages: [
          { url: "https://images.unsplash.com/photo-1598928506311-c55dd1b31bb1?w=800&q=80" }
        ],
        visitingHours: {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          startTime: "11:00",
          endTime: "20:00"
        }
      },
      {
        owner: b2bUserId,
        pgName: "Student Square Hostel",
        propertyType: "Hostel",
        genderAllowed: "Boys",
        isPublished: true,
        isFeatured: false,
        status: "approved",
        managerName: "Sanjay Gupta",
        managerPhone: "9999900004",
        managerEmail: "sanjay@example.com",
        postedBy: "Owner",
        postedByName: "Rajesh B2B",
        address: "Sector C, Near MANIT",
        area: "Indrapuri",
        city: "Bhopal",
        pinCode: "462022",
        latitude: 23.2485,
        longitude: 77.4612,
        totalBeds: 100,
        totalRooms: 50,
        amenities: ["WiFi", "Meals", "Laundry", "CCTV"],
        roomTypes: [
          { name: "Four Sharing Dorm", type: "quad", price: 5000, capacity: "4 persons", attachedBathroom: false, balcony: false }
        ],
        nearbyPlaces: [
          { name: "MANIT Bhopal", distance: "0.2" }
        ],
        coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
        galleryImages: [
          { url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80" }
        ],
        visitingHours: {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          startTime: "10:00",
          endTime: "17:00"
        }
      },
      {
        owner: b2bUserId2,
        pgName: "Serenity Women's Hostel",
        propertyType: "Hostel",
        genderAllowed: "Girls",
        isPublished: true,
        isFeatured: false,
        status: "approved",
        managerName: "Priya Reddy",
        managerPhone: "9999900005",
        managerEmail: "priya@serenity.com",
        postedBy: "Owner",
        postedByName: "Vikram B2B",
        address: "Near Minal Residency",
        area: "Ayodhya Bypass",
        city: "Bhopal",
        pinCode: "462041",
        latitude: 23.2715,
        longitude: 77.4589,
        totalBeds: 80,
        totalRooms: 40,
        amenities: ["WiFi", "AC", "Meals", "CCTV", "RO Water"],
        roomTypes: [
          { name: "Standard Double", type: "double", price: 6500, capacity: "2 persons", attachedBathroom: true, balcony: false }
        ],
        nearbyPlaces: [
          { name: "Minal Shopping", distance: "0.4" }
        ],
        coverImage: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
        galleryImages: [
          { url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80" }
        ],
        visitingHours: {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          startTime: "10:00",
          endTime: "18:00"
        }
      },
      {
        owner: b2bUserId2,
        pgName: "The Collective Home Stay",
        propertyType: "Home Stay",
        genderAllowed: "Unisex",
        isPublished: true,
        isFeatured: true,
        status: "approved",
        managerName: "Arjun Rao",
        managerPhone: "9753186420",
        managerEmail: "arjun@thecollective.in",
        postedBy: "Owner",
        postedByName: "Vikram B2B",
        address: "Kolar Road",
        area: "Chuna Bhatti",
        city: "Bhopal",
        pinCode: "462016",
        latitude: 23.1912,
        longitude: 77.4128,
        totalBeds: 50,
        totalRooms: 25,
        amenities: ["WiFi", "AC", "Housekeeping", "RO Water", "CCTV"],
        roomTypes: [
          { name: "Smart Double", type: "double", price: 15000, capacity: "2 persons", attachedBathroom: true, balcony: false }
        ],
        nearbyPlaces: [
          { name: "Chuna Bhatti Square", distance: "0.2" }
        ],
        coverImage: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
        galleryImages: [
          { url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80" }
        ],
        visitingHours: {
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          startTime: "08:00",
          endTime: "20:00"
        }
      }
    ];

    await Property.create(propertiesData);
    console.log('Seeded properties successfully!');

    console.log('Seeding successful!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
