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
exports.destinationService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createDestinationIntoDb = (userId, destinationData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(destinationData);
    const { data, destinationImage } = destinationData;
    const result = yield prisma_1.default.destination.create({
        data: {
            destinationName: data.destinationName,
            location: data.location ? data.location : '',
            latitude: data.latitude,
            longitude: data.longitude,
            image: destinationImage,
            userId: userId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'destination not created');
    }
    return result;
});
const getDestinationListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.destination.findMany();
    if (result.length === 0) {
        return { message: 'No destination found' };
    }
    return result;
});
const getDestinationByIdFromDb = (destinationId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.destination.findUnique({
        where: {
            id: destinationId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'destination not found');
    }
    return result;
});
const updateDestinationIntoDb = (userId, destinationId, destinationData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, destinationImage } = destinationData;
    const updateData = Object.assign(Object.assign({}, data), { userId: userId });
    if (destinationImage !== undefined) {
        updateData.image = destinationImage;
    }
    const result = yield prisma_1.default.destination.update({
        where: {
            id: destinationId,
            userId: userId,
        },
        data: Object.assign({}, updateData),
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'destinationId, not updated');
    }
    return result;
});
const deleteDestinationItemFromDb = (userId, destinationId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.destination.delete({
        where: {
            id: destinationId,
            userId: userId,
        },
    });
    if (!deletedItem) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'destinationId, not deleted');
    }
    return deletedItem;
});
exports.destinationService = {
    createDestinationIntoDb,
    getDestinationListFromDb,
    getDestinationByIdFromDb,
    updateDestinationIntoDb,
    deleteDestinationItemFromDb,
};
