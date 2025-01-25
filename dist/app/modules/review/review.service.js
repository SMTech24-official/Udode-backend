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
exports.reviewService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createReviewIntoDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.create({
        data: Object.assign(Object.assign({}, data), { userId: userId }),
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Review not created');
    }
    return result;
});
const getReviewListFromDb = (terminalId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findMany({
        where: {
            terminalId: terminalId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    image: true,
                },
            },
        },
    });
    if (result.length === 0) {
        return { message: 'Review not found' };
    }
    return result;
});
const getReviewByIdFromDb = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.findUnique({
        where: {
            id: reviewId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Review not found');
    }
    return result;
});
const updateReviewIntoDb = (userId, reviewId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.review.update({
        where: {
            id: reviewId,
            userId: userId,
        },
        data: {
            comment: data.comment,
            rating: data.rating,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Review not updated');
    }
    return result;
});
const deleteReviewItemFromDb = (userId, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.review.delete({
        where: {
            id: reviewId,
            userId: userId,
        },
    });
    if (!deletedItem) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Review not deleted');
    }
    return deletedItem;
});
exports.reviewService = {
    createReviewIntoDb,
    getReviewListFromDb,
    getReviewByIdFromDb,
    updateReviewIntoDb,
    deleteReviewItemFromDb,
};
