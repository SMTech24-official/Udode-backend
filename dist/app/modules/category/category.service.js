"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createCategoryIntoDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.create({
        data: Object.assign(Object.assign({}, data), { userId: userId })
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Category not created');
    }
    return result;
});
const getCategoryListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.findMany();
    if (result.length === 0) {
        return { message: 'Category not found' };
    }
    return result;
});
const getCategoryByIdFromDb = (userId, categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.findUnique({
        where: {
            id: categoryId,
        }
    });
    if (!result) {
        throw new Error('Category not found');
    }
    return result;
});
const updateCategoryIntoDb = (userId, categoryId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.category.update({
        where: {
            id: categoryId,
            userId: userId,
        },
        data: {
            categoryName: data.categoryName,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Category not updated');
    }
    return result;
});
const deleteCategoryItemFromDb = (userId, categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.category.delete({
        where: {
            id: categoryId,
            userId: userId,
        },
    });
    if (!deletedItem) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Category not deleted');
    }
    return deletedItem;
});
exports.categoryService = {
    createCategoryIntoDb,
    getCategoryListFromDb,
    getCategoryByIdFromDb,
    updateCategoryIntoDb,
    deleteCategoryItemFromDb,
};
