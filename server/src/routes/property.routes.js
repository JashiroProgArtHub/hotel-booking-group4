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
import { createPropertySchema, updatePropertySchema } from '../schemas/property.schema.js';

const router = Router();

router.get('/search', searchProperties);
router.get('/owner/my-properties', requireAuth, authorize('HOTEL_OWNER'), getOwnerProperties);
router.get('/:id', getPropertyById);

router.post('/', requireAuth, validateBody(createPropertySchema), createProperty);
router.put('/:id', requireAuth, authorize('HOTEL_OWNER'), validateBody(updatePropertySchema), updateProperty);

export default router;
