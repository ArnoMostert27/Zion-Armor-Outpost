import dotenv from 'dotenv';
import connectDB from './config/db.js';
import app from './app.js';

/**
 * Local development entry point - a long-running Node process.
 * In production Vercel imports ../api/index.js instead, which uses the same
 * app.js but never calls listen().
 */

dotenv.config();

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
} catch (error) {
  console.error('\x1b[31m[outpost] Could not reach the database. Exiting.\x1b[0m');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(
    `\x1b[33m[outpost] Gate open on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode\x1b[0m`
  );
});
