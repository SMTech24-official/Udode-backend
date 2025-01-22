import { z } from 'zod';

const createSchema = z.object({
  tripId: z.string(),
  parentId: z.string().optional(),
  comment: z.string(),
});

const updateSchema = z.object({
  tripId: z.string(),
  parentId: z.string().optional(),
  comment: z.string().optional(),
});

export const commentValidation = {
createSchema,
updateSchema,
};