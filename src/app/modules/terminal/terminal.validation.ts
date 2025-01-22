import { z } from 'zod';

const createSchema = z.object({
  terminalName: z.string(),
  fareRange: z.string(),
  vendorName: z.string(),
  location: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  openingHours: z.string(),
  transportationType: z.string(),
});

const updateSchema = z.object({
  terminalName: z.string().optional(),
  fareRange: z.string().optional(),
  vendorName: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingHours: z.string().optional(),
  transportationType: z.string().optional(),
});

export const terminalValidation = {
  createSchema,
  updateSchema,
};
