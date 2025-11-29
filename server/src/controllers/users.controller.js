import prisma from '../config/database.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export const getCurrentUser = async (req, res) => {
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
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError(
      'Your account was not found in our system. Please sign out and sign in again to sync your account.'
    );
  }

  res.json({
    success: true,
    data: user,
  });
};
