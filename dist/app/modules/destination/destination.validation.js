"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destinationValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        destinationName: zod_1.z.string().min(1, 'Name is required'),
        location: zod_1.z.string().optional(),
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z.object({
        destinationName: zod_1.z.string().min(1, 'Name is required').optional(),
        location: zod_1.z.string().optional(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
    }),
});
exports.destinationValidation = {
    createSchema,
    updateSchema,
};
