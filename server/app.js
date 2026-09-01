import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bundleRoutes from './routes/bundleRoutes.js';
import readingPlanRoutes from './routes/readingPlanRoutes.js';

/**
 * The Express application, with no knowledge of how it is being served.
 *
 * This file deliberately does NOT connect to the database and does NOT call
 * listen(). Two different entry points use it:
 *
 *   server.js      long-running Node process for local development
 *   ../api/index.js  Vercel serverless function in production
 *
 * Keeping the app free of both concerns is what lets the same routes run
 * unchanged in either environment.
 */
const app = express();

// Vercel (and any PaaS) sits behind a proxy. Without this, Express reads the
// internal connection as plain HTTP and refuses to set the `secure` cookie.
app.set('trust proxy', 1);

// On Vercel the client and API share an origin, so CORS is not needed at all.
// It stays configured for local development, where Vite is on :5173 and the
// API is on :5000, and for anyone who splits the two back apart later.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and tools like curl send no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'standing',
    outpost: 'Zion Armor Outpost',
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'node',
    time: new Date().toISOString(),
  });
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bundle', bundleRoutes);
app.use('/api/plans', readingPlanRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
