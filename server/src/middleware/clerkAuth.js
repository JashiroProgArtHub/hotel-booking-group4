import { clerkMiddleware, getAuth } from '@clerk/express';
import { AuthenticationError } from './errorHandler.js';

export const clerkAuthMiddleware = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const requireAuth = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return next(new AuthenticationError('Authentication required. Please provide a valid token.'));
  }

  req.auth = auth;
  next();
};

export const optionalAuth = (req, res, next) => {
  const auth = getAuth(req);

  req.auth = auth.userId ? auth : null;
  next();
};
