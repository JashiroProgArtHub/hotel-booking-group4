import { Router } from 'express';
import {
  searchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  getOwnerProperties
} from '../controllers/property.controller.js';
import { requireAuth } from '../middleware/clerkAuth.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createPropertySchema, updatePropertySchema } from '../schemas/property.schema.js';

const router = Router();

router.get('/search', asyncHandler(searchProperties));
router.get('/owner/my-properties', requireAuth, authorize('HOTEL_OWNER'), asyncHandler(getOwnerProperties));
router.get('/:id', asyncHandler(getPropertyById));

router.post('/', requireAuth, validateBody(createPropertySchema), asyncHandler(createProperty));
router.put('/:id', requireAuth, authorize('HOTEL_OWNER'), validateBody(updatePropertySchema), asyncHandler(updateProperty));

export default router;
