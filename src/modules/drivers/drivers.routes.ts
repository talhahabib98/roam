import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate, currentUser } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { updateStatusSchema } from './drivers.schema';
import { getDriverByUserId, updateDriverStatus } from './drivers.service';

export const driversRouter = Router();

driversRouter.use(authenticate, requireRole('DRIVER'));

driversRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const driver = await getDriverByUserId(currentUser(req).id);
    res.json({ driver });
  }),
);

driversRouter.put(
  '/me/status',
  validate({ body: updateStatusSchema }),
  asyncHandler(async (req, res) => {
    const driver = await updateDriverStatus(currentUser(req).id, req.body);
    res.json({ driver });
  }),
);
