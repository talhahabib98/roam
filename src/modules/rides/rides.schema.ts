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

export const listRidesQuerySchema = z.object({
  status: z.enum(['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export type ListRidesQuery = z.infer<typeof listRidesQuerySchema>;
export type RideRequestInput = z.infer<typeof rideRequestSchema>;
