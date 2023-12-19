import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE']),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
