"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryValidation = void 0;
const zod_1 = require("zod");
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string().min(1, 'Name is required'),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string(),
    }),
});
exports.categoryValidation = {
    createSchema,
    updateSchema,
};
