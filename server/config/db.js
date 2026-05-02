const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not defined in environment variables!');
      return;
    }
    console.log(`Attempting to connect to MongoDB... (URI starts with: ${process.env.MONGODB_URI.substring(0, 20)}...)`);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process on Vercel
  }
};

module.exports = connectDB;
