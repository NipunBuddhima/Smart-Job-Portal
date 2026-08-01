import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      logger.error('MONGO_URI is not defined in the environment variables.');
      process.exit(1);
    }

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoURI);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure code if the connection drops
    process.exit(1);
  }
};