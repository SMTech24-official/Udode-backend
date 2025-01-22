"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    tripId: zod_1.z.string(),
    parentId: zod_1.z.string().optional(),
    comment: zod_1.z.string(),
});
const updateSchema = zod_1.z.object({
    tripId: zod_1.z.string(),
    parentId: zod_1.z.string().optional(),
    comment: zod_1.z.string().optional(),
});
exports.commentValidation = {
    createSchema,
    updateSchema,
};
