import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in your .env file');
    }

    // ✅ EXPLICITLY DISABLE RETRYABLE WRITES HERE
    await mongoose.connect(mongoUri, {
      retryWrites: false,
    });
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;