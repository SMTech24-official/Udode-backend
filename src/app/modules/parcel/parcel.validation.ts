import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    description: z.string(),
    from: z.string(),
    to: z.string(),
    phone: z.string(),
    emergencyNote: z.string(),
    parcelTransportPrice: z.number(),
    endDateTime: z.string(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    description: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    phone: z.string().optional(),
    emergencyNote: z.string().optional(),
    parcelTransportPrice: z.number().optional(),
    endDateTime: z.string().optional(),
  }),
});

const parcelStatus = z.object({
  body: z.object({

 parcelStatus: z.enum(['PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED', 'COMPLETED']),
  
  }),
});

export const parcelValidation = {
  createSchema,
  updateSchema,
  parcelStatus,
};
