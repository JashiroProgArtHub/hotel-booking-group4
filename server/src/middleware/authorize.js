import prisma from '../config/database.js';
import { clerkClient } from '@clerk/express';
import { findOrCreateUser } from '../utils/user.utils.js';

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required. Please provide a valid token.'
        });
      }

      const clerkUserId = req.auth.userId;

      let user = await prisma.user.findUnique({
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
        try {
          const clerkUser = await clerkClient.users.getUser(clerkUserId);

          const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;

          if (!email) {
            return res.status(400).json({
              success: false,
              error: 'Bad Request',
              message: 'User email not found in Clerk. Cannot create user account.'
            });
          }

          user = await findOrCreateUser(clerkUserId, {
            email,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null
          });

          console.log(`✅ Auto-created user during authorization: ${user.email} (${user.id})`);
        } catch (clerkError) {
          console.error('Error fetching user from Clerk:', clerkError);
          return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'Failed to retrieve user information from authentication service.'
          });
        }
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${user.role}`
        });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred during authorization. Please try again.'
      });
    }
  };
};

export default authorize;
