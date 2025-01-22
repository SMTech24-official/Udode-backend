import { z } from 'zod';

const createSchema = z.object({

    image: z.string(),
    description: z.string(),
    from: z.string(),
    to: z.string(),
    phone: z.string(),
    emergencyNote: z.string(),
    parcelTransportPrice: z.number(),
    endDateTime: z.string(),
    
});

const updateSchema = z.object({

    image: z.string().optional(),
    description: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    phone: z.string().optional(),
    emergencyNote: z.string().optional(),
    parcelTransportPrice: z.number().optional(),
    endDateTime: z.string().optional(),

});

export const parcelValidation = {
createSchema,
updateSchema,
};