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
exports.terminalService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createTerminalIntoDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.terminal.create({
        data: Object.assign(Object.assign({}, data), { userId: userId }),
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Terminal not created');
    }
    return result;
});
const getTerminalListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.terminal.findMany();
    if (result.length === 0) {
        return { message: 'Terminal not found' };
    }
    return result;
});
const getTerminalByIdFromDb = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.terminal.findUnique({ where: { id } });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Terminal not found');
    }
    return result;
});
const updateTerminalIntoDb = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.terminal.update({
        where: { id },
        data,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_MODIFIED, 'Terminal not updated');
    }
    return result;
});
const deleteTerminalItemFromDb = (userId, terminalId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const deletedItem = yield prisma.terminal.delete({
            where: {
                id: terminalId,
                userId: userId,
            },
        });
        if (!deletedItem) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Terminal not deleted');
        }
        return deletedItem;
    }));
    return transaction;
});
;
exports.terminalService = {
    createTerminalIntoDb,
    getTerminalListFromDb,
    getTerminalByIdFromDb,
    updateTerminalIntoDb,
    deleteTerminalItemFromDb,
};
