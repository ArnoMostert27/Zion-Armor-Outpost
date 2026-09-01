import connectDB from '../server/config/db.js';
import app from '../server/app.js';

/**
 * Vercel serverless entry point.
 *
 * Every /api/* request is routed here by the rewrite in vercel.json. The
 * database connection is cached inside connectDB(), so a warm invocation
 * reuses the existing pool instead of opening a new one.
 *
 * Note this file imports nothing from npm directly - only relative paths into
 * server/. Node resolves a package from the folder of the file that imports it,
 * so express and mongoose resolve out of server/node_modules where they are
 * declared. Importing a package here instead would look in the repo root, where
 * it is not installed, and fail at runtime. dotenv is not needed either:
 * Vercel injects environment variables into the process directly.
 */

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    return res.status(503).json({
      message: 'The outpost cannot reach its records right now. Try again in a moment.',
    });
  }

  // Depending on how the rewrite resolves, Vercel may hand the function a URL
  // with or without the /api prefix. The Express router always expects it, so
  // normalise here rather than duplicating routes.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
}
