import { Router } from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getCurrentUser } from '../controllers/users.controller.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(getCurrentUser));

export default router;
