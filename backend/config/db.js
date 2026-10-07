import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 * Exits the process on failure so the server doesn't run without a database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    
    // Drop indexes on users collection to ensure sparse unique index updates take effect immediately
    try {
      await conn.connection.db.collection('users').dropIndexes();
      console.log('✅ Users collection indexes dropped for recreation');
    } catch (err) {
      console.log('⚠️ Could not drop users indexes (collection might not exist or indexes already dropped):', err.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
