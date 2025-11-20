import prisma from '../config/database.js';
import { AuthenticationError, AuthorizationError, NotFoundError } from './errorHandler.js';

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        throw new AuthenticationError('Authentication required. Please provide a valid token.');
      }

      const clerkUserId = req.auth.userId;

      const user = await prisma.user.findUnique({
        where: { clerkUserId },
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new NotFoundError('Your account was not found in our system. Please sign out and sign in again to sync your account.');
      }

      if (!roles.includes(user.role)) {
        throw new AuthorizationError(`Access denied. Required role(s): ${roles.join(', ')}. Your role: ${user.role}`);
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authorize;
