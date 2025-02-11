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
exports.terminalFeedService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createTerminalFeedIntoDb = (userId, terminalFeedData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, terminalFeedImage } = terminalFeedData;
    const result = yield prisma_1.default.terminalFeed.create({
        data: Object.assign(Object.assign({}, data), { image: terminalFeedImage, userId: userId }),
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'TerminalFeed not created');
    }
    return result;
});
const getTerminalFeedListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.terminalFeed.findMany();
    if (result.length === 0) {
        return { message: 'TerminalFeed not found' };
    }
    return result;
});
const getTerminalFeedByIdFromDb = (userId, terminalFeedId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.terminalFeed.findUnique({
        where: {
            id: terminalFeedId,
        },
    });
    if (!result) {
        throw new Error('TerminalFeed not found');
    }
    return result;
});
const updateTerminalFeedIntoDb = (userId, terminalFeedId, terminalFeedData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, terminalFeedImage } = terminalFeedData;
    const updateData = Object.assign(Object.assign({}, data), { userId: userId });
    if (terminalFeedImage !== undefined) {
        updateData.image = terminalFeedImage;
    }
    const result = yield prisma_1.default.terminalFeed.update({
        where: {
            id: terminalFeedId,
        },
        data: updateData,
    });
    return result;
});
const deleteTerminalFeedItemFromDb = (userId, terminalFeedId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.terminalFeed.delete({
        where: {
            id: terminalFeedId,
            userId: userId,
        },
    });
    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
});
exports.terminalFeedService = {
    createTerminalFeedIntoDb,
    getTerminalFeedListFromDb,
    getTerminalFeedByIdFromDb,
    updateTerminalFeedIntoDb,
    deleteTerminalFeedItemFromDb,
};
