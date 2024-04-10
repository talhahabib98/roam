import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { authenticate, currentUser } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { rideIdParamsSchema, rideRequestSchema } from './rides.schema';
import {
  acceptRide,
  cancelRide,
  completeRide,
  createRide,
  estimateRide,
  getRideForUser,
  startRide,
} from './rides.service';

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

ridesRouter.get(
  '/:id',
  validate({ params: rideIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const ride = await getRideForUser(req.params.id, currentUser(req));
    res.json({ ride });
  }),
);

ridesRouter.post(
  '/:id/accept',
  requireRole('DRIVER'),
  validate({ params: rideIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const ride = await acceptRide(req.params.id, currentUser(req).id);
    res.json({ ride });
  }),
);

ridesRouter.post(
  '/:id/start',
  requireRole('DRIVER'),
  validate({ params: rideIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const ride = await startRide(req.params.id, currentUser(req).id);
    res.json({ ride });
  }),
);

ridesRouter.post(
  '/:id/complete',
  requireRole('DRIVER'),
  validate({ params: rideIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const ride = await completeRide(req.params.id, currentUser(req).id);
    res.json({ ride });
  }),
);

ridesRouter.post(
  '/:id/cancel',
  validate({ params: rideIdParamsSchema }),
  asyncHandler(async (req, res) => {
    const ride = await cancelRide(req.params.id, currentUser(req));
    res.json({ ride });
  }),
);
