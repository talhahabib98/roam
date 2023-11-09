import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schema';
import { loginUser, registerUser } from './auth.service';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    res.status(201).json({ user });
  }),
);

authRouter.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    res.json(result);
  }),
);
