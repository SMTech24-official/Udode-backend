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
exports.tripService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createTripIntoDb = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.trip.create({
        data: Object.assign(Object.assign({}, data), { tripDate: new Date(data.tripDate), userId: userId }),
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Trip not created');
    }
    return result;
});
const getTripListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.trip.findMany();
    if (result.length === 0) {
        return { message: 'Trip not found' };
    }
    return result;
});
const getTripByIdFromDb = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.trip.findUnique({
        where: {
            id: tripId,
        },
    });
    if (!result) {
        throw new Error('Trip not found');
    }
    return result;
});
const updateTripIntoDb = (userId, tripId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.trip.update({
        where: {
            id: tripId,
            userId: userId,
        },
        data: Object.assign(Object.assign({}, data), { tripDate: new Date(data.tripDate) })
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_MODIFIED, 'Trip not updated');
    }
    return result;
});
const deleteTripItemFromDb = (userId, tripId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.trip.delete({
        where: {
            id: tripId,
            userId: userId,
        },
    });
    return deletedItem;
});
exports.tripService = {
    createTripIntoDb,
    getTripListFromDb,
    getTripByIdFromDb,
    updateTripIntoDb,
    deleteTripItemFromDb,
};
