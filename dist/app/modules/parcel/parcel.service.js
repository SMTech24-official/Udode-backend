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
exports.parcelService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createParcelIntoDb = (userId, parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, parcelImage } = parcelData;
    const result = yield prisma_1.default.parcel.create({
        data: Object.assign(Object.assign({}, data), { image: parcelImage, userId: userId }),
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Parcel not created');
    }
    return result;
});
const getParcelListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findMany();
    if (result.length === 0) {
        return { message: 'Parcel not found' };
    }
    return result;
});
const getParcelByIdFromDb = (userId, parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findUnique({
        where: {
            id: parcelId,
        },
    });
    if (!result) {
        throw new Error('Parcel not found');
    }
    return result;
});
const getParcelListByUserFromDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findMany({
        where: {
            OR: [
                {
                    userId: userId,
                },
                {
                    deliveryPersonId: userId,
                }
            ],
        },
    });
    if (!result) {
        throw new Error('Parcel not found');
    }
    return result;
});
const updateParcelIntoDb = (userId, parcelId, parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, parcelImage } = parcelData;
    const updateData = Object.assign(Object.assign({}, data), { userId: userId });
    if (parcelImage !== undefined) {
        updateData.image = parcelImage;
    }
    const result = yield prisma_1.default.parcel.update({
        where: {
            id: parcelId,
        },
        data: updateData,
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Parcel not updated');
    }
    return result;
});
const deleteParcelItemFromDb = (userId, parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedItem = yield prisma_1.default.parcel.delete({
        where: {
            id: parcelId,
            userId: userId,
        },
    });
    if (!deletedItem) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Parcel not deleted');
    }
    return deletedItem;
});
exports.parcelService = {
    createParcelIntoDb,
    getParcelListFromDb,
    getParcelByIdFromDb,
    updateParcelIntoDb,
    deleteParcelItemFromDb,
    getParcelListByUserFromDb,
};
