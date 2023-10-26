import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { validate } from '../../middleware/validate';
import { registerSchema } from './auth.schema';
import { registerUser } from './auth.service';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  }),
);
