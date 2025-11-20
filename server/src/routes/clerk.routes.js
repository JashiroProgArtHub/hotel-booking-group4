import express from 'express';
import { handleClerkWebhook } from '../controllers/clerk.controller.js';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default router;
