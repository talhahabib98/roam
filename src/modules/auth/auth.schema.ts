import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(72),
    name: z.string().trim().min(1).max(100),
    role: z.enum(['RIDER', 'DRIVER']),
    vehicleModel: z.string().trim().min(1).max(100).optional(),
    vehiclePlate: z.string().trim().min(1).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== 'DRIVER') return;
    for (const field of ['vehicleModel', 'vehiclePlate'] as const) {
      if (!data[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'Required for drivers',
        });
      }
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
