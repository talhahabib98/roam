import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE']),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
