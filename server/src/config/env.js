import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bug_arena',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_bug_arena_jwt_key_2026_dev_env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development'
};
