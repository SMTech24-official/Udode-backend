import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    destinationName: z.string().min(1, 'Name is required'),
    location: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    destinationName: z.string().min(1, 'Name is required').optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const destinationValidation = {
createSchema,
updateSchema,
};