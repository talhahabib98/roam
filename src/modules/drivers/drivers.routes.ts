import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate, currentUser } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { getDriverByUserId } from './drivers.service';

export const driversRouter = Router();

driversRouter.use(authenticate, requireRole('DRIVER'));

driversRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const driver = await getDriverByUserId(currentUser(req).id);
    res.json({ driver });
  }),
);
