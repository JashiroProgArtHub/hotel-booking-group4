import { clerkMiddleware, requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';

export const clerkAuthMiddleware = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const requireAuth = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required. Please provide a valid token.'
    });
  }

  req.auth = auth;
  next();
};

export const optionalAuth = (req, res, next) => {
  const auth = getAuth(req);

  req.auth = auth.userId ? auth : null;
  next();
};
