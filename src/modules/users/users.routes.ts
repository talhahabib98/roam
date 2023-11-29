import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { HttpError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { toPublicUser } from '../auth/auth.service';

export const usersRouter = Router();

usersRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      throw HttpError.unauthorized('User no longer exists');
    }
    res.json({ user: toPublicUser(user) });
  }),
);
