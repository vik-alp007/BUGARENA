import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 BUG ARENA Backend API Server active on port ${config.port}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base: http://localhost:${config.port}/api`);
      console.log(`======================================================\n`);
    });

    const shutdown = async () => {
      console.log('\nGracefully shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal Server Startup Error:', error.message);
    process.exit(1);
  }
};

startServer();
