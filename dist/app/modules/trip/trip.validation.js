"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        terminalId: zod_1.z.string(),
        destination: zod_1.z.string(),
        tripDate: zod_1.z.string(),
        additionalNote: zod_1.z.string(),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z.object({
        terminalId: zod_1.z.string(),
        destination: zod_1.z.string().optional(),
        tripDate: zod_1.z.string().optional(),
        additionalNote: zod_1.z.string().optional(),
    }),
});
exports.tripValidation = {
    createSchema,
    updateSchema,
};
