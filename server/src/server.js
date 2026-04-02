import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  try {
    if (!env.jwtSecret) {
      throw new Error('JWT_SECRET is missing. Add it to the server environment.');
    }

    await connectDb(env.mongoUri);

    app.listen(env.port, () => {
      console.log(`Finance dashboard API running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
