const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not defined in environment variables!');
      return;
    }
    console.log(`Attempting to connect to MongoDB... (URI starts with: ${process.env.MONGODB_URI.substring(0, 20)}...)`);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop old single-field unique indexes if they exist
    try {
      await User.collection.dropIndex('phone_1');
      console.log('Successfully dropped old single-field unique index: phone_1');
    } catch (e) {
      // Index might not exist, which is fine
    }

    try {
      await User.collection.dropIndex('email_1');
      console.log('Successfully dropped old single-field unique index: email_1');
    } catch (e) {
      // Index might not exist, which is fine
    }

    // Sync current indexes defined in schema
    try {
      await User.syncIndexes();
      console.log('User indexes synchronized successfully.');
    } catch (e) {
      console.error('Error synchronizing User indexes:', e.message);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process on Vercel
  }
};

module.exports = connectDB;
