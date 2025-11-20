import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} from '../controllers/booking.controller.js';
import { requireAuth } from '../middleware/clerkAuth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createBookingSchema } from '../schemas/booking.schema.js';

const router = Router();

router.post('/', requireAuth, validateBody(createBookingSchema), asyncHandler(createBooking));
router.get('/my-bookings', requireAuth, asyncHandler(getMyBookings));
router.get('/:id', requireAuth, asyncHandler(getBookingById));
router.patch('/:id/cancel', requireAuth, asyncHandler(cancelBooking));

export default router;
