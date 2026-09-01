import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Exits the process on failure so the app never runs half-connected.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\x1b[36m[outpost] MongoDB connected: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m[outpost] MongoDB connection error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

export default connectDB;
