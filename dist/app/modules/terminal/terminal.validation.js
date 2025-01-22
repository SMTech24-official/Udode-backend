"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    terminalName: zod_1.z.string(),
    fareRange: zod_1.z.string(),
    vendorName: zod_1.z.string(),
    location: zod_1.z.string(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    openingHours: zod_1.z.string(),
    transportationType: zod_1.z.string(),
});
const updateSchema = zod_1.z.object({
    terminalName: zod_1.z.string().optional(),
    fareRange: zod_1.z.string().optional(),
    vendorName: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    openingHours: zod_1.z.string().optional(),
    transportationType: zod_1.z.string().optional(),
});
exports.terminalValidation = {
    createSchema,
    updateSchema,
};
