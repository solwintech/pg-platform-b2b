const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Property = require('./models/Property');
const Lead = require('./models/Lead');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedLeads = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB...');

    // Clear existing leads
    await Lead.deleteMany();
    console.log('Cleared old leads');

    // Get some properties
    const properties = await Property.find().limit(5);
    if (properties.length === 0) {
      console.log('No properties found to attach leads to.');
      process.exit();
    }

    const sampleLeads = [
      { name: 'Amit Sharma', phone: '9876543210', email: 'amit@example.com', type: 'Enquiry', message: 'Looking for a single room.' },
      { name: 'Suresh Kumar', phone: '8877665544', email: 'suresh@example.com', type: 'Call', message: 'Inquired about parking.' },
      { name: 'Priya Singh', phone: '7766554433', email: 'priya@example.com', type: 'WhatsApp', message: 'Interested in twin sharing.' },
      { name: 'Rahul Verma', phone: '9988776655', email: 'rahul@example.com', type: 'Enquiry', message: 'Is food included?' },
      { name: 'Sneha Patel', phone: '8899001122', email: 'sneha@example.com', type: 'Call', message: 'Checking availability for next month.' }
    ];

    for (let i = 0; i < sampleLeads.length; i++) {
      const prop = properties[i % properties.length];
      await Lead.create({
        ...sampleLeads[i],
        property: prop._id,
        owner: prop.owner,
        status: i % 3 === 0 ? 'New' : i % 3 === 1 ? 'Contacted' : 'Qualified'
      });
    }

    console.log(`Successfully seeded ${sampleLeads.length} leads!`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedLeads();
