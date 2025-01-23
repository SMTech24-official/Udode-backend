import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    terminalId: z.string(),
    destination: z.string(),
    tripDate: z.string(),
    additionalNote: z.string(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    terminalId: z.string(),
    destination: z.string().optional(),
    tripDate: z.string().optional(),
    additionalNote: z.string().optional(),
  }),
});

export const tripValidation = {
  createSchema,
  updateSchema,
};
