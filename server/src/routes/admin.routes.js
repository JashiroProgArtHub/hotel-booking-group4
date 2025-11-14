import express from 'express';
import { requireAuth } from '../middleware/clerkAuth.js';
import { authorize } from '../middleware/authorize.js';
import { getPendingProperties, getAllProperties, approveProperty, rejectProperty, getAllBookings } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/properties/pending', requireAuth, authorize('ADMIN'), getPendingProperties);
router.get('/properties', requireAuth, authorize('ADMIN'), getAllProperties);
router.patch('/properties/:id/approve', requireAuth, authorize('ADMIN'), approveProperty);
router.patch('/properties/:id/reject', requireAuth, authorize('ADMIN'), rejectProperty);
router.get('/bookings', requireAuth, authorize('ADMIN'), getAllBookings);

export default router;
