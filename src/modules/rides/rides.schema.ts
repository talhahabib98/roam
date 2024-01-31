import { z } from 'zod';

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const rideRequestSchema = z.object({
  pickup: coordinatesSchema,
  dropoff: coordinatesSchema,
});

export const rideIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type RideRequestInput = z.infer<typeof rideRequestSchema>;
