const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string from environment variable
    // Format: mongodb+srv://username:password@cluster0.j0gdg.mongodb.net/database-name?retryWrites=true&w=majority
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
