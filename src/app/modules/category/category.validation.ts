import { z } from 'zod';

const createSchema = z.object({
  categoryName: z.string().min(1, 'Name is required'),
  
});

const updateSchema = z.object({
  categoryName: z.string().optional(),
});

export const categoryValidation = {
createSchema,
updateSchema,
};