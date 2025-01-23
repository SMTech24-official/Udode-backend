import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    tripId: z.string(),
    parentId: z.string().optional(),
    comment: z.string(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    tripId: z.string(),
    comment: z.string(),
  }),
});

export const commentValidation = {
  createSchema,
  updateSchema,
};
