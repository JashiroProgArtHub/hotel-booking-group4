import { Webhook } from 'svix';
import prisma from '../config/database.js';

export async function handleClerkWebhook(req, res) {
  try {
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing Clerk webhook headers');
      return res.status(400).json({
        success: false,
        error: 'Missing webhook headers'
      });
    }

    const payload = req.body.toString();
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let event;
    try {
      event = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Clerk webhook signature verification failed:', err.message);
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const eventType = event.type;
    const userData = event.data;

    console.log(`Clerk webhook received: ${eventType}`, {
      userId: userData.id,
      email: userData.email_addresses?.[0]?.email_address
    });

    try {
      switch (eventType) {
        case 'user.created':
          await handleUserCreated(userData);
          break;

        case 'user.updated':
          await handleUserUpdated(userData);
          break;

        case 'user.deleted':
          await handleUserDeleted(userData);
          break;

        default:
          console.log(`Unhandled Clerk webhook event: ${eventType}`);
      }

      return res.status(200).json({
        success: true,
        received: true
      });

    } catch (error) {
      console.error(`Error processing ${eventType}:`, error.message);

      return res.status(200).json({
        success: false,
        received: true,
        error: error.message
      });
    }

  } catch (error) {
    console.error('Clerk webhook processing error:', error);

    return res.status(200).json({
      success: false,
      received: true,
      error: 'Webhook processing failed'
    });
  }
}

async function handleUserCreated(userData) {
  try {
    const email = userData.email_addresses?.[0]?.email_address;

    if (!email) {
      console.error('No email found in Clerk user data:', userData.id);
      throw new Error('User email is required');
    }

    const user = await prisma.user.create({
      data: {
        clerkUserId: userData.id,
        email: email,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        role: 'CUSTOMER',
      },
    });

    console.log('User created in database:', {
      clerkUserId: user.clerkUserId,
      email: user.email,
      role: user.role
    });

    return user;

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User already exists, skipping creation:', userData.id);
      return await prisma.user.findUnique({
        where: { clerkUserId: userData.id }
      });
    }

    console.error('Failed to create user:', error.message);
    throw error;
  }
}

async function handleUserUpdated(userData) {
  try {
    const email = userData.email_addresses?.[0]?.email_address;

    const user = await prisma.user.update({
      where: { clerkUserId: userData.id },
      data: {
        email: email,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
      },
    });

    console.log('User updated in database:', {
      clerkUserId: user.clerkUserId,
      email: user.email
    });

    return user;

  } catch (error) {
    if (error.code === 'P2025') {
      console.log('User not found for update, creating instead:', userData.id);
      return await handleUserCreated(userData);
    }

    console.error('Failed to update user:', error.message);
    throw error;
  }
}

async function handleUserDeleted(userData) {
  try {
    try {
      const user = await prisma.user.update({
        where: { clerkUserId: userData.id },
        data: {
          deletedAt: new Date(),
        },
      });

      console.log('User soft deleted in database:', {
        clerkUserId: user.clerkUserId,
        email: user.email,
        deletedAt: user.deletedAt
      });

      return user;

    } catch (error) {
      if (error.message.includes('deletedAt')) {
        console.log('User model does not have deletedAt field');
        console.log('User deleted in Clerk but kept in database:', userData.id);

        return await prisma.user.findUnique({
          where: { clerkUserId: userData.id }
        });
      }

      throw error;
    }

  } catch (error) {
    if (error.code === 'P2025') {
      console.log('User not found for deletion:', userData.id);
      return null;
    }

    console.error('Failed to delete user:', error.message);
    throw error;
  }
}
