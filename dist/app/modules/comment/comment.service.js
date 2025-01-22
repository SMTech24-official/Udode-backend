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
exports.commentService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createCommentIntoDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.create({
        data: Object.assign(Object.assign({}, data), { userId: userId })
    });
    return result;
});
const getCommentListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.findMany();
    if (result.length === 0) {
        return { message: 'Comment not found' };
    }
    return result;
});
const getCommentByIdFromDb = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.findUnique({
        where: {
            id: tripId,
        }
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Comment not found');
    }
    return result;
});
const updateCommentIntoDb = (userId, tripId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.comment.update({
        where: {
            id: tripId,
            userId: userId,
        },
        data,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_MODIFIED, 'Comment not updated');
    }
    return result;
});
const deleteCommentItemFromDb = (userId, tripId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.comment.delete({
        where: {
            id: tripId,
            userId: userId,
        },
    });
    if (!deletedItem) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Comment not deleted');
    }
    return deletedItem;
});
exports.commentService = {
    createCommentIntoDb,
    getCommentListFromDb,
    getCommentByIdFromDb,
    updateCommentIntoDb,
    deleteCommentItemFromDb,
};
