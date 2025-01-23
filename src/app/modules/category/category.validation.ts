import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    categoryName: z.string().min(1, 'Name is required'),
  }),
});

const updateSchema = z.object({
  body: z.object({
    categoryName: z.string(),
  }),
});

export const categoryValidation = {
  createSchema,
  updateSchema,
};
