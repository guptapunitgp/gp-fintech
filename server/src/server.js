import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  try {
    // console.log("ENV CHECK:");
    // console.log("JWT:", env.jwtSecret);
    // console.log("MONGO:", env.mongoUri);

    if (!env.jwtSecret) {
      console.warn("JWT_SECRET missing - using fallback");
    }

    if (!env.mongoUri) {
      console.error("MONGO_URI missing");
      process.exit(1);
    }

    await connectDb(env.mongoUri);

    const PORT = env.port || process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('START ERROR:', error);
    process.exit(1);
  }
}

startServer();