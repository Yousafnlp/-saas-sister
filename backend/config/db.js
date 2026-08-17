import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('MONGO_URI is not set in the environment. Copy .env.example to .env and configure it.');
    process.exit(1);
  }

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
