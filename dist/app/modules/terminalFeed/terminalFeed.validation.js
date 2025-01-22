"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalFeedValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    description: zod_1.z.string().min(3).max(255),
    terminalId: zod_1.z.string(),
    trafficStatus: zod_1.z.string(),
});
const updateSchema = zod_1.z.object({
    description: zod_1.z.string().min(3).max(255).optional(),
    terminalId: zod_1.z.string(),
    trafficStatus: zod_1.z.string().optional(),
});
exports.terminalFeedValidation = {
    createSchema,
    updateSchema,
};
