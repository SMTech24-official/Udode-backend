import { z } from 'zod';

const createSchema = z.object({
  description: z.string().min(3).max(255),
  terminalId: z.string(),
  trafficStatus: z.string(),
});

const updateSchema = z.object({
  description: z.string().min(3).max(255).optional(),
  terminalId: z.string(),
  trafficStatus: z.string().optional(),
});

export const terminalFeedValidation = {
  createSchema,
  updateSchema,
};
