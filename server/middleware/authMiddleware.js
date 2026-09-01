import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * Verifies the JWT from the Authorization header (or the httpOnly cookie)
 * and attaches the user document to req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorised - no token supplied');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorised - user no longer exists');
    }
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorised - token failed verification');
  }
});

/** Restricts a route to the Outpost Keeper (admin). */
export const keeperOnly = (req, res, next) => {
  if (req.user && req.user.role === 'keeper') return next();
  res.status(403);
  throw new Error('Only the Outpost Keeper may pass');
};
