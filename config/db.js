const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodb_indexing_demo';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;