import prisma from '../config/database.js';

export async function getUser(clerkUserId) {
  if (!clerkUserId) {
    throw new Error('clerkUserId is required');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      throw new Error(`User not found for Clerk ID: ${clerkUserId}. Please sign in again or contact support.`);
    }

    return user;

  } catch (error) {
    console.error('Error in getUser:', error);
    throw error;
  }
}
