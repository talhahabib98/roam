import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { driversRouter } from './modules/drivers/drivers.routes';
import { ridesRouter } from './modules/rides/rides.routes';
import { usersRouter } from './modules/users/users.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/drivers', driversRouter);
apiRouter.use('/rides', ridesRouter);
