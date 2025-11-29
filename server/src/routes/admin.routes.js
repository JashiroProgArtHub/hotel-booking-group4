import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPendingProperties, getAllProperties, approveProperty, rejectProperty, getAllBookings, getAllUsers, updateUserRole } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/properties/pending', requireAuth, authorize('ADMIN'), asyncHandler(getPendingProperties));
router.get('/properties', requireAuth, authorize('ADMIN'), asyncHandler(getAllProperties));
router.patch('/properties/:id/approve', requireAuth, authorize('ADMIN'), asyncHandler(approveProperty));
router.patch('/properties/:id/reject', requireAuth, authorize('ADMIN'), asyncHandler(rejectProperty));
router.get('/bookings', requireAuth, authorize('ADMIN'), asyncHandler(getAllBookings));
router.get('/users', requireAuth, authorize('ADMIN'), asyncHandler(getAllUsers));
router.patch('/users/:id/role', requireAuth, authorize('ADMIN'), asyncHandler(updateUserRole));

export default router;
