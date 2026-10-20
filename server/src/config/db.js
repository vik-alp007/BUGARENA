import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async (customUri = null) => {
  const uri = customUri || config.mongoUri;
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`\n[Database Connection Error] Unable to connect to MongoDB at: ${uri}`);
    console.error(`Error details: ${error.message}`);
    console.error(`
================================================================================
ACTIONABLE SETUP INSTRUCTIONS:
1. Ensure MongoDB is installed and running locally:
   - macOS (Homebrew): brew services start mongodb-community
     Or run manually:  mongod --config /opt/homebrew/etc/mongod.conf
   - Linux:            sudo systemctl start mongod
   - Docker:           docker run -d -p 27017:27017 --name bugarena-mongo mongo:latest
2. If using MongoDB Atlas or a remote database, configure MONGODB_URI in server/.env:
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bug_arena
================================================================================\n`);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
