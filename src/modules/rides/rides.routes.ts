import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { rideRequestSchema } from './rides.schema';
import { estimateRide } from './rides.service';

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
