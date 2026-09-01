import jwt from 'jsonwebtoken';

/**
 * Signs a JWT for a user id and also sets it as an httpOnly cookie.
 * Returning the token as well keeps the client flexible (header or cookie auth).
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  // Client and API share an origin on Vercel, so 'lax' is correct and safer
  // than 'none' - it keeps the cookie out of genuine cross-site requests.
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
