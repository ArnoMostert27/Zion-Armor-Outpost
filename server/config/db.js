import mongoose from 'mongoose';

/**
 * Serverless-safe MongoDB connection.
 *
 * On Vercel every request may hit a fresh function invocation, but warm
 * invocations reuse the same Node process. Calling mongoose.connect() each time
 * would open a new pool per request and exhaust Atlas's connection limit within
 * minutes. So the connection (and the in-flight promise) is cached on
 * globalThis, which survives between warm invocations.
 *
 * Locally this is simply a connection that is created once.
 */

const globalCache = globalThis;

if (!globalCache._zaoMongoose) {
  globalCache._zaoMongoose = { conn: null, promise: null };
}

const cached = globalCache._zaoMongoose;

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Check your environment variables.');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        // Keep the pool small - serverless spreads load across many instances.
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .then((connection) => {
        console.log(`\x1b[36m[outpost] MongoDB connected: ${connection.connection.host}\x1b[0m`);
        return connection;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the failed promise so the next request retries instead of
    // permanently caching a rejection.
    cached.promise = null;
    console.error(`\x1b[31m[outpost] MongoDB connection error: ${error.message}\x1b[0m`);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
