import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate, currentUser } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { rideRequestSchema } from './rides.schema';
import { createRide, estimateRide } from './rides.service';

export const ridesRouter = Router();

ridesRouter.use(authenticate);

ridesRouter.post(
  '/estimate',
  requireRole('RIDER'),
  validate({ body: rideRequestSchema }),
  (req, res) => {
    res.json({ estimate: estimateRide(req.body) });
  },
);

ridesRouter.post(
  '/',
  requireRole('RIDER'),
  validate({ body: rideRequestSchema }),
  asyncHandler(async (req, res) => {
    const ride = await createRide(currentUser(req).id, req.body);
    res.status(201).json({ ride });
  }),
);
