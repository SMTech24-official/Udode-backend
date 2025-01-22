import { z } from 'zod';

const createSchema = z.object({
  terminalId: z.string(),
  description: z.string(),
  tripDate: z.string(),
  additionalNote: z.string(),
});

const updateSchema = z.object({
  terminalId: z.string(),
  description: z.string().optional(),
  tripDate: z.string().optional(),
  additionalNote: z.string().optional(),
});

export const tripValidation = {
createSchema,
updateSchema,
};