"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        description: zod_1.z.string(),
        from: zod_1.z.string(),
        to: zod_1.z.string(),
        phone: zod_1.z.string(),
        emergencyNote: zod_1.z.string(),
        parcelTransportPrice: zod_1.z.number(),
        endDateTime: zod_1.z.string(),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z.object({
        description: zod_1.z.string().optional(),
        from: zod_1.z.string().optional(),
        to: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        emergencyNote: zod_1.z.string().optional(),
        parcelTransportPrice: zod_1.z.number().optional(),
        endDateTime: zod_1.z.string().optional(),
    }),
});
const parcelStatus = zod_1.z.object({
    body: zod_1.z.object({
        parcelStatus: zod_1.z.enum(['PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED', 'COMPLETED']),
    }),
});
exports.parcelValidation = {
    createSchema,
    updateSchema,
    parcelStatus,
};
