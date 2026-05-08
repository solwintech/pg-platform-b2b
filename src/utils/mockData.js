// Complete mockData.js - Replace your existing file with this

// ==================== PG LISTINGS ====================
export const mockListings = [
  {
    id: 1,
    pgName: "Sunshine PG",
    propertyType: "PG",
    genderAllowed: "Boys",
    status: "approved",
    createdAt: "2024-01-15",
    price: 8000,
    deposit: 10000,
    bookingAmount: 2000,
    maintenance: 500,
    foodCharges: 2500,
    electricityCharges: "Included",
    
    // Location Details
    address: "123, 80 Feet Road, Koramangala 4th Block",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560034",
    landmark: "Near Forum Mall",
    latitude: 12.9352,
    longitude: 77.6245,
    nearbyPlaces: [
      { name: "Forum Mall", distance: "0.5" },
      { name: "Koramangala Metro", distance: "1.2" },
      { name: "NIMHANS Hospital", distance: "2.0" }
    ],
    
    // Property Details
    totalFloors: 3,
    floorNumber: "Ground, 1st, 2nd",
    totalRooms: 25,
    totalBeds: 50,
    availableBeds: 15,
    
    // Manager Details
    managerName: "Rajesh Kumar",
    managerPhone: "9876543210",
    managerEmail: "rajesh@sunshine.com",
    managerPassword: "sunshine123",
    
    // Amenities
    amenities: ["WiFi", "AC", "Parking", "CCTV", "Power Backup", "Laundry"],

    houseRules: [
      "No visitors allowed after 8 PM",
      "Strictly no smoking or alcohol",
      "Electricity charges extra as per sub-meter",
      "Maintenance fee payable every quarter"
    ],
    description: "Premium PG accommodation in the heart of Koramangala. Perfect for working professionals looking for a clean and quiet environment with all essential services included.",

    
    // Room Types
    roomTypes: [
      {
        id: 101,
        name: "Single",
        price: 8000,
        capacity: "1 person",
        size: "120 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        availableRooms: 5,
        amenities: ["AC", "Study Table", "Wardrobe", "Bed"],
        description: "Spacious single room with attached bathroom"
      },
      {
        id: 102,
        name: "Double",
        price: 12000,
        capacity: "2 persons",
        size: "200 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        availableRooms: 8,
        amenities: ["AC", "Study Table", "Wardrobe", "Bed", "TV"],
        description: "Comfortable double sharing room"
      }
    ],
    
    // Rooms (individual room instances)
    rooms: [
      {
        id: 1001,
        roomNumber: "101",
        roomType: "Single",
        price: 8000,
        capacity: "1 person",
        size: "120 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        status: "occupied",
        tenantName: "Rahul Sharma",
        tenantPhone: "9876543210",
        tenantEmail: "rahul@example.com",
        moveInDate: "2024-01-15",
        amenities: ["AC", "Study Table", "Wardrobe"]
      },
      {
        id: 1002,
        roomNumber: "102",
        roomType: "Single",
        price: 8000,
        capacity: "1 person",
        size: "120 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        status: "vacant",
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        moveInDate: "",
        amenities: ["AC", "Study Table", "Wardrobe"]
      },
      {
        id: 1003,
        roomNumber: "103",
        roomType: "Double",
        price: 12000,
        capacity: "2 persons",
        size: "200 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        status: "occupied",
        tenantName: "Priya Singh & Neha Gupta",
        tenantPhone: "9876543211",
        tenantEmail: "priya@example.com",
        moveInDate: "2024-02-01",
        amenities: ["AC", "Study Table", "Wardrobe", "TV"]
      },
      {
        id: 1004,
        roomNumber: "104",
        roomType: "Double",
        price: 12000,
        capacity: "2 persons",
        size: "200 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        status: "vacant",
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        moveInDate: "",
        amenities: ["AC", "Study Table", "Wardrobe"]
      }
    ],
    
    // Offer
    offer: {
      type: "percentage",
      value: 20,
      validTill: "2024-12-31",
      description: "20% off on first month rent"
    },
    
    // Media
    coverImage: "https://images.unsplash.com/photo-1554995207-c18c203602cb",
    galleryImages: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    ],
    
    // Stats
    views: 1250,
    leads: [
      { id: 1, name: "Amit Singh", phone: "9988776655", date: "2024-01-21", type: "Call" },
      { id: 2, name: "Rahul Verma", phone: "9988776633", date: "2024-01-19", type: "Call" }
    ]
  },
  {
    id: 2,
    pgName: "Luxury Home Stay Space",
    propertyType: "Home Stay",
    genderAllowed: "Girls",
    status: "pending",
    createdAt: "2024-01-20",
    price: 15000,
    deposit: 20000,
    bookingAmount: 5000,
    maintenance: 1000,
    foodCharges: 3000,
    electricityCharges: "Separate",
    
    address: "456, 100 Feet Road, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560038",
    landmark: "Near Indiranagar Metro",
    latitude: 12.9784,
    longitude: 77.6408,
    nearbyPlaces: [
      { name: "Indiranagar Metro", distance: "0.3" },
      { name: "Phoenix Mall", distance: "1.5" },
      { name: "Vydehi Hospital", distance: "2.0" }
    ],
    
    totalFloors: 4,
    floorNumber: "1st, 2nd, 3rd, 4th",
    totalRooms: 30,
    totalBeds: 30,
    availableBeds: 8,
    
    managerName: "Priya Sharma",
    managerPhone: "9876543211",
    managerEmail: "priya@luxury.com",
    managerPassword: "luxury123",
    
    amenities: ["WiFi", "AC", "Gym", "Swimming Pool", "Housekeeping", "CCTV", "Lift"],
    
    roomTypes: [
      {
        id: 201,
        name: "Single",
        price: 15000,
        capacity: "1 person",
        size: "180 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        availableRooms: 3,
        amenities: ["AC", "Smart TV", "Mini Fridge", "Study Table"],
        description: "Premium single room with modern amenities"
      },
      {
        id: 202,
        name: "Double",
        price: 22000,
        capacity: "2 persons",
        size: "280 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: true,
        availableRooms: 5,
        amenities: ["AC", "Smart TV", "Full Fridge", "Study Table", "Microwave"],
        description: "Luxury double room with kitchenette"
      }
    ],
    
    rooms: [
      {
        id: 2001,
        roomNumber: "201",
        roomType: "Single",
        price: 15000,
        capacity: "1 person",
        size: "180 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        status: "occupied",
        tenantName: "Neha Gupta",
        tenantPhone: "9876543212",
        tenantEmail: "neha@example.com",
        moveInDate: "2024-01-25",
        amenities: ["AC", "Smart TV", "Mini Fridge"]
      },
      {
        id: 2002,
        roomNumber: "202",
        roomType: "Single",
        price: 15000,
        capacity: "1 person",
        size: "180 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        status: "vacant",
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        moveInDate: "",
        amenities: ["AC", "Smart TV", "Mini Fridge"]
      }
    ],
    
    offer: {
      type: "fixed",
      value: 2000,
      validTill: "2024-03-31",
      description: "₹2000 off on booking"
    },
    
    coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    galleryImages: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    ],
    
    views: 980,
    leads: [
      { id: 3, name: "Neha Gupta", phone: "9988776644", date: "2024-01-21", type: "Enquiry" }
    ]
  },
  {
    id: 3,
    pgName: "Student Hostel",
    propertyType: "Hostel",
    genderAllowed: "Boys",
    status: "approved",
    createdAt: "2024-01-18",
    price: 6000,
    deposit: 5000,
    bookingAmount: 1000,
    maintenance: 300,
    foodCharges: 3500,
    electricityCharges: "Per unit",
    
    address: "789, ITPL Main Road, Whitefield",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560066",
    landmark: "Near ITPL",
    latitude: 12.9698,
    longitude: 77.7499,
    nearbyPlaces: [
      { name: "ITPL", distance: "0.5" },
      { name: "Nexus Mall", distance: "1.0" }
    ],
    
    totalFloors: 2,
    floorNumber: "Ground, 1st",
    totalRooms: 40,
    totalBeds: 100,
    availableBeds: 25,
    
    managerName: "Amit Singh",
    managerPhone: "9876543212",
    managerEmail: "amit@studenthostel.com",
    managerPassword: "student123",
    
    amenities: ["WiFi", "Laundry", "CCTV", "Study Room", "Parking"],
    
    roomTypes: [
      {
        id: 301,
        name: "Triple",
        price: 6000,
        capacity: "3 persons",
        size: "250 sq ft",
        attachedBathroom: false,
        balcony: false,
        kitchen: false,
        availableRooms: 8,
        amenities: ["Fan", "Study Table", "Bunk Bed", "Cupboard"],
        description: "Economical triple sharing room"
      },
      {
        id: 302,
        name: "Dormitory",
        price: 4500,
        capacity: "6 persons",
        size: "400 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        availableRooms: 4,
        amenities: ["Fan", "Personal Locker", "Common Table"],
        description: "Budget dormitory for students"
      }
    ],
    
    rooms: [
      {
        id: 3001,
        roomNumber: "G-01",
        roomType: "Triple",
        price: 6000,
        capacity: "3 persons",
        size: "250 sq ft",
        attachedBathroom: false,
        balcony: false,
        kitchen: false,
        status: "occupied",
        tenantName: "Vikram, Rohan, Ankit",
        tenantPhone: "9876543213",
        tenantEmail: "vikram@example.com",
        moveInDate: "2024-01-10",
        amenities: ["Fan", "Study Table"]
      },
      {
        id: 3002,
        roomNumber: "G-02",
        roomType: "Triple",
        price: 6000,
        capacity: "3 persons",
        size: "250 sq ft",
        attachedBathroom: false,
        balcony: false,
        kitchen: false,
        status: "vacant",
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        moveInDate: "",
        amenities: ["Fan", "Study Table"]
      }
    ],
    
    offer: {
      type: "percentage",
      value: 15,
      validTill: "2024-06-30",
      description: "Student special - 15% off"
    },
    
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
    galleryImages: [],
    
    views: 2100,
    leads: [
      { id: 4, name: "Rahul Verma", phone: "9988776633", date: "2024-01-20", type: "Call" },
      { id: 5, name: "Vikram Singh", phone: "9988776611", date: "2024-01-19", type: "Call" }
    ]
  },
  {
    id: 4,
    pgName: "Executive PG",
    propertyType: "PG",
    genderAllowed: "Unisex",
    status: "approved",
    createdAt: "2024-01-12",
    price: 12000,
    deposit: 15000,
    bookingAmount: 3000,
    maintenance: 800,
    foodCharges: 4000,
    electricityCharges: "Included",
    
    address: "321, 27th Main, HSR Layout Sector 1",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560102",
    landmark: "Near HSR BDA Complex",
    latitude: 12.9121,
    longitude: 77.6446,
    nearbyPlaces: [
      { name: "HSR BDA Complex", distance: "0.2" },
      { name: "Ecospace Business Park", distance: "1.8" }
    ],
    
    totalFloors: 3,
    floorNumber: "1st, 2nd, 3rd",
    totalRooms: 20,
    totalBeds: 40,
    availableBeds: 10,
    
    managerName: "Neha Gupta",
    managerPhone: "9876543213",
    managerEmail: "neha@executivepg.com",
    managerPassword: "executive123",
    
    amenities: ["WiFi", "AC", "Gym", "Housekeeping", "Lift", "Power Backup", "RO Water"],
    
    roomTypes: [
      {
        id: 401,
        name: "Single",
        price: 12000,
        capacity: "1 person",
        size: "150 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        availableRooms: 4,
        amenities: ["AC", "Study Table", "Wardrobe", "TV"],
        description: "Executive single room for professionals"
      },
      {
        id: 402,
        name: "Double",
        price: 18000,
        capacity: "2 persons",
        size: "240 sq ft",
        attachedBathroom: true,
        balcony: true,
        kitchen: false,
        availableRooms: 3,
        amenities: ["AC", "Study Table", "Wardrobe", "TV", "Mini Fridge"],
        description: "Premium double room"
      }
    ],
    
    rooms: [
      {
        id: 4001,
        roomNumber: "101",
        roomType: "Single",
        price: 12000,
        capacity: "1 person",
        size: "150 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        status: "occupied",
        tenantName: "Rajesh Malhotra",
        tenantPhone: "9876543214",
        tenantEmail: "rajesh@example.com",
        moveInDate: "2024-01-05",
        amenities: ["AC", "Study Table", "TV"]
      },
      {
        id: 4002,
        roomNumber: "102",
        roomType: "Single",
        price: 12000,
        capacity: "1 person",
        size: "150 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        status: "vacant",
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        moveInDate: "",
        amenities: ["AC", "Study Table", "TV"]
      }
    ],
    
    offer: {
      type: "fixed",
      value: 1000,
      validTill: "2024-02-28",
      description: "Early bird ₹1000 off"
    },
    
    coverImage: "https://images.unsplash.com/photo-1560185008-5f61f8a44f79",
    galleryImages: [],
    
    views: 750,
    leads: [
      { id: 6, name: "Priya Patel", phone: "9988776622", date: "2024-01-20", type: "Enquiry" }
    ]
  },
  {
    id: 5,
    pgName: "Green Valley PG",
    propertyType: "PG",
    genderAllowed: "Boys",
    status: "pending",
    createdAt: "2024-01-22",
    price: 7000,
    deposit: 8000,
    bookingAmount: 1500,
    maintenance: 400,
    foodCharges: 3000,
    electricityCharges: "Separate",
    
    address: "567, Electronic City Phase 1",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560100",
    landmark: "Near Wipro Gate",
    latitude: 12.8399,
    longitude: 77.6770,
    nearbyPlaces: [
      { name: "Wipro Campus", distance: "0.5" },
      { name: "Electronic City Metro", distance: "1.0" }
    ],
    
    totalFloors: 2,
    floorNumber: "Ground, 1st",
    totalRooms: 30,
    totalBeds: 60,
    availableBeds: 20,
    
    managerName: "Vikram Mehta",
    managerPhone: "9876543214",
    managerEmail: "vikram@greenvalley.com",
    managerPassword: "green123",
    
    amenities: ["WiFi", "Parking", "CCTV", "RO Water", "Laundry"],
    
    roomTypes: [
      {
        id: 501,
        name: "Double",
        price: 7000,
        capacity: "2 persons",
        size: "180 sq ft",
        attachedBathroom: false,
        balcony: false,
        kitchen: false,
        availableRooms: 10,
        amenities: ["Fan", "Study Table", "Wardrobe"],
        description: "Standard double sharing room"
      },
      {
        id: 502,
        name: "Triple",
        price: 9000,
        capacity: "3 persons",
        size: "260 sq ft",
        attachedBathroom: true,
        balcony: false,
        kitchen: false,
        availableRooms: 5,
        amenities: ["Fan", "Study Table", "Wardrobe", "Attached Bathroom"],
        description: "Triple room with attached bathroom"
      }
    ],
    
    rooms: [
      {
        id: 5001,
        roomNumber: "101",
        roomType: "Double",
        price: 7000,
        capacity: "2 persons",
        size: "180 sq ft",
        attachedBathroom: false,
        balcony: false,
        kitchen: false,
        status: "occupied",
        tenantName: "Suresh & Mahesh",
        tenantPhone: "9876543215",
        tenantEmail: "suresh@example.com",
        moveInDate: "2024-01-18",
        amenities: ["Fan", "Study Table"]
      },
      {
        id: 5002,
        roomNumber: "102",
        roomType: "Double",
        price: 7000,
        capacity: "2 persons",
        size: "180 sq ft",
        attachedBathroom: false,
        balcony: false,
        kitchen: false,
        status: "vacant",
        tenantName: "",
        tenantPhone: "",
        tenantEmail: "",
        moveInDate: "",
        amenities: ["Fan", "Study Table"]
      }
    ],
    
    offer: null,
    
    coverImage: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
    galleryImages: [],
    
    views: 890,
    leads: []
  }
];

// ==================== LEADS ====================
export const mockLeads = [
  {
    id: 1,
    userName: "Amit Singh",
    userPhone: "9988776655",
    userEmail: "amit.singh@example.com",
    propertyName: "Sunshine PG",
    propertyId: 1,
    timestamp: "2024-01-21 10:30 AM",
    actionType: "Call",
    status: "New",
    message: "Interested in single room, wants to visit today"
  },
  {
    id: 2,
    userName: "Neha Gupta",
    userPhone: "9988776644",
    userEmail: "neha.gupta@example.com",
    propertyName: "Luxury Home Stay Space",
    propertyId: 2,
    timestamp: "2024-01-21 11:45 AM",
    actionType: "Enquiry",
    status: "New",
    message: "Looking for premium single room with attached bathroom"
  },
  {
    id: 3,
    userName: "Rahul Verma",
    userPhone: "9988776633",
    userEmail: "rahul.verma@example.com",
    propertyName: "Student Hostel",
    propertyId: 3,
    timestamp: "2024-01-20 02:15 PM",
    actionType: "Call",
    status: "Contacted",
    message: "Student looking for budget accommodation"
  },
  {
    id: 4,
    userName: "Priya Patel",
    userPhone: "9988776622",
    userEmail: "priya.patel@example.com",
    propertyName: "Executive PG",
    propertyId: 4,
    timestamp: "2024-01-20 09:30 AM",
    actionType: "Enquiry",
    status: "Contacted",
    message: "Working professional, needs AC room"
  },
  {
    id: 5,
    userName: "Vikram Singh",
    userPhone: "9988776611",
    userEmail: "vikram.singh@example.com",
    propertyName: "Green Valley PG",
    propertyId: 5,
    timestamp: "2024-01-19 04:20 PM",
    actionType: "Call",
    status: "Interested",
    message: "Will visit tomorrow for double room"
  },
  {
    id: 6,
    userName: "Anjali Mehta",
    userPhone: "9988776600",
    userEmail: "anjali.mehta@example.com",
    propertyName: "Sunshine PG",
    propertyId: 1,
    timestamp: "2024-01-18 03:00 PM",
    actionType: "Enquiry",
    status: "Interested",
    message: "Need double room for 2 girls"
  },
  {
    id: 7,
    userName: "Rohit Sharma",
    userPhone: "9988776599",
    userEmail: "rohit.sharma@example.com",
    propertyName: "Luxury Home Stay Space",
    propertyId: 2,
    timestamp: "2024-01-17 11:00 AM",
    actionType: "Call",
    status: "New",
    message: "Looking for short-term stay (3 months)"
  },
  {
    id: 8,
    userName: "Kavya Reddy",
    userPhone: "9988776588",
    userEmail: "kavya.reddy@example.com",
    propertyName: "Student Hostel",
    propertyId: 3,
    timestamp: "2024-01-16 05:30 PM",
    actionType: "Enquiry",
    status: "Contacted",
    message: "Engineering student needs nearby accommodation"
  }
];

// ==================== MANAGERS ====================
export const mockManagers = [
  {
    id: 100,
    name: "Rajesh Kumar",
    email: "rajesh@sunshine.com",
    phone: "9876543210",
    username: "rajesh@sunshine.com",
    password: "sunshine123",
    assignedProperties: [1],
    permissions: {
      viewDashboard: true,
      viewLeads: true,
      viewAnalytics: true,
      updateAvailability: true,
      editPricing: false,
      respondToReviews: false,
      viewTenants: true,
      editRoomStatus: true
    },
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2024-01-21 09:30 AM",
    source: "property"
  },
  {
    id: 101,
    name: "Priya Sharma",
    email: "priya@luxury.com",
    phone: "9876543211",
    username: "priya@luxury.com",
    password: "luxury123",
    assignedProperties: [2],
    permissions: {
      viewDashboard: true,
      viewLeads: true,
      viewAnalytics: true,
      updateAvailability: true,
      editPricing: true,
      respondToReviews: true,
      viewTenants: true,
      editRoomStatus: true
    },
    status: "active",
    createdAt: "2024-01-20",
    lastLogin: "2024-01-20 02:00 PM",
    source: "property"
  },
  {
    id: 102,
    name: "Amit Singh",
    email: "amit@studenthostel.com",
    phone: "9876543212",
    username: "amit@studenthostel.com",
    password: "student123",
    assignedProperties: [3],
    permissions: {
      viewDashboard: true,
      viewLeads: true,
      viewAnalytics: true,
      updateAvailability: true,
      editPricing: false,
      respondToReviews: false,
      viewTenants: true,
      editRoomStatus: true
    },
    status: "active",
    createdAt: "2024-01-18",
    lastLogin: null,
    source: "property"
  },
  {
    id: 103,
    name: "Neha Gupta",
    email: "neha@executivepg.com",
    phone: "9876543213",
    username: "neha@executivepg.com",
    password: "executive123",
    assignedProperties: [4],
    permissions: {
      viewDashboard: true,
      viewLeads: true,
      viewAnalytics: true,
      updateAvailability: true,
      editPricing: true,
      respondToReviews: true,
      viewTenants: true,
      editRoomStatus: true
    },
    status: "inactive",
    createdAt: "2024-01-12",
    lastLogin: "2024-01-15 10:00 AM",
    source: "property"
  },
  {
    id: 104,
    name: "Vikram Mehta",
    email: "vikram@greenvalley.com",
    phone: "9876543214",
    username: "vikram@greenvalley.com",
    password: "green123",
    assignedProperties: [5],
    permissions: {
      viewDashboard: true,
      viewLeads: true,
      viewAnalytics: true,
      updateAvailability: false,
      editPricing: false,
      respondToReviews: false,
      viewTenants: false,
      editRoomStatus: false
    },
    status: "active",
    createdAt: "2024-01-22",
    lastLogin: null,
    source: "property"
  }
];

// ==================== OFFERS ====================
export const mockOffers = [
  {
    id: 1,
    title: "Early Bird Discount",
    code: "EARLY20",
    type: "percentage",
    value: 20,
    minRent: 8000,
    maxDiscount: 5000,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    applicableTo: "new_bookings",
    usageLimit: 50,
    usedCount: 23,
    status: "active",
    description: "Get 20% off on first month rent for bookings made 15 days in advance",
    properties: ["Sunshine PG", "Luxury Home Stay"]
  },
  {
    id: 2,
    title: "Student Special",
    code: "STUDENT15",
    type: "percentage",
    value: 15,
    minRent: 6000,
    maxDiscount: 3000,
    validFrom: "2024-01-01",
    validTo: "2024-06-30",
    applicableTo: "students",
    usageLimit: 100,
    usedCount: 45,
    status: "active",
    description: "15% discount for students with valid ID card",
    properties: ["Student Hostel", "Budget PG"]
  },
  {
    id: 3,
    title: "Group Booking Offer",
    code: "GROUP10",
    type: "percentage",
    value: 10,
    minRent: 15000,
    maxDiscount: 10000,
    validFrom: "2024-01-01",
    validTo: "2024-03-31",
    applicableTo: "group_booking",
    usageLimit: 20,
    usedCount: 8,
    status: "active",
    description: "10% off for group bookings of 3 or more rooms",
    properties: ["Luxury Home Stay", "Executive PG"]
  },
  {
    id: 4,
    title: "Referral Discount",
    code: "REFER500",
    type: "fixed",
    value: 500,
    minRent: 5000,
    maxDiscount: 500,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    applicableTo: "referral",
    usageLimit: 200,
    usedCount: 67,
    status: "active",
    description: "₹500 off for both referrer and referee",
    properties: ["All Properties"]
  },
  {
    id: 5,
    title: "New Year Special",
    code: "NY2024",
    type: "fixed",
    value: 2000,
    minRent: 10000,
    maxDiscount: 2000,
    validFrom: "2023-12-20",
    validTo: "2024-01-15",
    applicableTo: "all",
    usageLimit: 30,
    usedCount: 30,
    status: "expired",
    description: "₹2000 off on bookings made during New Year week",
    properties: ["All Properties"]
  }
];

// ==================== REVIEWS ====================
export const mockReviews = [
  {
    id: 1,
    propertyId: 1,
    propertyName: "Sunshine PG",
    userName: "Amit Kumar",
    userImage: "AK",
    rating: 4.5,
    date: "2024-01-15",
    title: "Great place to stay!",
    comment: "Very clean and well-maintained PG. The staff is friendly and food is good. Highly recommended for students.",
    likes: 24,
    dislikes: 2,
    verified: true,
    reply: null,
    tags: ["Clean", "Good Food", "Friendly Staff"]
  },
  {
    id: 2,
    propertyId: 1,
    propertyName: "Sunshine PG",
    userName: "Priya Sharma",
    userImage: "PS",
    rating: 5,
    date: "2024-01-10",
    title: "Excellent experience!",
    comment: "Best PG in the area. Very cooperative owner and good amenities. WiFi speed is great.",
    likes: 18,
    dislikes: 1,
    verified: true,
    reply: "Thank you for your wonderful feedback! We're glad you enjoyed your stay.",
    tags: ["Excellent", "Good WiFi", "Cooperative"]
  },
  {
    id: 3,
    propertyId: 2,
    propertyName: "Luxury Home Stay",
    userName: "Rahul Verma",
    userImage: "RV",
    rating: 4,
    date: "2024-01-12",
    title: "Good but expensive",
    comment: "Nice property with great amenities. Location is perfect but rent is on higher side.",
    likes: 12,
    dislikes: 5,
    verified: true,
    reply: "Thank you for your feedback. We offer premium amenities which justify the pricing.",
    tags: ["Good Location", "Premium", "Clean"]
  },
  {
    id: 4,
    propertyId: 2,
    propertyName: "Luxury Home Stay",
    userName: "Neha Gupta",
    userImage: "NG",
    rating: 5,
    date: "2024-01-08",
    title: "Absolutely love it!",
    comment: "The best home stay space I've ever stayed in. Modern furniture, great community events.",
    likes: 32,
    dislikes: 0,
    verified: true,
    reply: null,
    tags: ["Modern", "Community", "Amazing"]
  },
  {
    id: 5,
    propertyId: 3,
    propertyName: "Student Hostel",
    userName: "Vikram Singh",
    userImage: "VS",
    rating: 3.5,
    date: "2024-01-14",
    title: "Average experience",
    comment: "Basic amenities. Food quality needs improvement. Good for budget-conscious students.",
    likes: 8,
    dislikes: 10,
    verified: true,
    reply: null,
    tags: ["Budget", "Basic", "Needs Improvement"]
  },
  {
    id: 6,
    propertyId: 3,
    propertyName: "Student Hostel",
    userName: "Anjali Mehta",
    userImage: "AM",
    rating: 4,
    date: "2024-01-05",
    title: "Good value for money",
    comment: "Decent place for students. Close to college and metro station.",
    likes: 15,
    dislikes: 3,
    verified: true,
    reply: "Thank you for your review! We're working on improving our services.",
    tags: ["Good Location", "Value for Money"]
  }
];

// ==================== AMENITIES ====================
export const mockAmenities = [
  "WiFi", "AC", "Laundry", "Housekeeping", "Power Backup", 
  "Parking", "CCTV", "Security Guard", "Lift", "RO Water", "Gym",
  "Swimming Pool", "Gaming Zone", "Study Room", "Library", "Meditation Area"
];

// ==================== USERS ====================
export const mockUsers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@sunshine.com",
    phone: "9876543210",
    role: "b2b",
    status: "active",
    joinedDate: "2024-01-10",
    properties: [1]
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@luxury.com",
    phone: "9876543211",
    role: "b2b",
    status: "active",
    joinedDate: "2024-01-15",
    properties: [2]
  },
  {
    id: 3,
    name: "Amit Singh",
    email: "amit@studenthostel.com",
    phone: "9876543212",
    role: "b2b",
    status: "active",
    joinedDate: "2024-01-18",
    properties: [3]
  },
  {
    id: 4,
    name: "Neha Gupta",
    email: "neha@executivepg.com",
    phone: "9876543213",
    role: "b2b",
    status: "inactive",
    joinedDate: "2024-01-12",
    properties: [4]
  },
  {
    id: 5,
    name: "Admin User",
    email: "admin@pgplatform.com",
    phone: "9876543214",
    role: "admin",
    status: "active",
    joinedDate: "2024-01-01",
    properties: []
  }
];

// ==================== STATS ====================
export const statsData = {
  b2b: {
    totalListings: 5,
    activeListings: 4,
    pendingListings: 1,
    totalLeads: 8,
    totalViews: 5970,
    occupancyRate: 78
  },
  admin: {
    totalUsers: 5,
    totalListings: 5,
    totalLeads: 8,
    pendingApprovals: 1,
    totalManagers: 5,
    activeManagers: 4
  }
};

// Helper function to get property by ID
export const getPropertyById = (id) => {
  return mockListings.find(p => p.id === parseInt(id));
};

// Helper function to get leads by property ID
export const getLeadsByProperty = (propertyId) => {
  return mockLeads.filter(l => l.propertyId === parseInt(propertyId));
};

// Helper function to get reviews by property ID
export const getReviewsByProperty = (propertyId) => {
  return mockReviews.filter(r => r.propertyId === parseInt(propertyId));
};

// Helper function to get manager by property ID
export const getManagerByProperty = (propertyId) => {
  return mockManagers.find(m => m.assignedProperties.includes(parseInt(propertyId)));
};