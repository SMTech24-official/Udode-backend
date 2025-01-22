import { z } from 'zod';

const createSchema = z.object({
  terminalId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
});

const updateSchema = z.object({
  terminalId: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const reviewValidation = {
createSchema,
updateSchema,
};