import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    description: z.string().min(3).max(255),
    terminalId: z.string(),
    trafficStatus: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    categoryId: z.string(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    description: z.string().min(3).max(255).optional(),
    terminalId: z.string(),
    trafficStatus: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    categoryId: z.string(),
  }),
});

export const terminalFeedValidation = {
  createSchema,
  updateSchema,
};
