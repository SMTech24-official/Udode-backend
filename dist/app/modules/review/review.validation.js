"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    terminalId: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string(),
});
const updateSchema = zod_1.z.object({
    terminalId: zod_1.z.string(),
    rating: zod_1.z.number().int().min(1).max(5).optional(),
    comment: zod_1.z.string().optional(),
});
exports.reviewValidation = {
    createSchema,
    updateSchema,
};
