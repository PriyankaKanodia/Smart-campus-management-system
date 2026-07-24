import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB(): Promise<boolean> {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not defined in environment variables.');
    console.warn('⚡ Using local JSON-file-based persistent fallback database for frictionless local development and live sandbox preview!');
    return false;
  }

  try {
    // Set connection options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.warn('⚡ Falling back to local JSON-file-based persistent database.');
    return false;
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
