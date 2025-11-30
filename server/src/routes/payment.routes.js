import { Router } from 'express';
import { createPaymentInvoice, handleXenditWebhook, verifyPaymentStatus } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/clerkAuth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createPaymentInvoiceSchema } from '../schemas/payment.schema.js';

const router = Router();

router.post('/create-invoice', requireAuth, validateBody(createPaymentInvoiceSchema), asyncHandler(createPaymentInvoice));

router.post('/webhook', handleXenditWebhook);

router.get('/verify/:bookingId', requireAuth, asyncHandler(verifyPaymentStatus));

export default router;
