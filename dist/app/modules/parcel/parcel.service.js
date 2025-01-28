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
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const Notification_service_1 = require("../Notification/Notification.service");
const createParcelIntoDb = (userId, parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, parcelImage } = parcelData;
    const result = yield prisma_1.default.parcel.create({
        data: {
            description: data.description,
            from: data.from,
            to: data.to,
            phone: data.phone,
            parcelTransportPrice: data.parcelTransportPrice,
            emergencyNote: data.emergencyNote,
            image: parcelImage,
            userId: userId,
            endDateTime: new Date(data.endDateTime),
            parcelStatus: client_1.ParcelStatus.PENDING,
            paymentStatus: client_1.PaymentStatus.PENDING,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Parcel not created');
    }
    return result;
});
const getParcelListFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findMany({
        where: {
            parcelStatus: client_1.ParcelStatus.PENDING,
        },
    });
    if (result.length === 0) {
        return { message: 'Parcel not found' };
    }
    const userIds = result.map(parcel => parcel.userId);
    const users = yield prisma_1.default.user.findMany({
        where: {
            id: { in: userIds },
        },
        select: {
            id: true,
            image: true,
            fullName: true,
            location: true,
        },
    });
    const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {});
    const parcelsWithUserInfo = result.map(parcel => (Object.assign(Object.assign({}, parcel), { user: userMap[parcel.userId] })));
    return parcelsWithUserInfo;
});
const getParcelByIdFromDb = (userId, parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findUnique({
        where: {
            id: parcelId,
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Parcel not found');
    }
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: result.userId,
        },
        select: {
            id: true,
            image: true,
            fullName: true,
            location: true,
        },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const parcelWithUser = Object.assign(Object.assign({}, result), { user: user });
    return parcelWithUser;
});
const getParcelListToPickupFromDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findMany({
        where: {
            deliveryPersonId: userId,
        },
        select: {
            id: true,
            description: true,
            from: true,
            to: true,
            phone: true,
            parcelTransportPrice: true,
            emergencyNote: true,
            image: true,
            userId: true,
            endDateTime: true,
            parcelStatus: true,
            paymentStatus: true,
        },
    });
    const userIds = result.map(parcel => parcel.userId);
    const users = yield prisma_1.default.user.findMany({
        where: {
            id: { in: userIds },
        },
        select: {
            id: true,
            fullName: true,
            image: true,
            location: true,
        },
    });
    const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {});
    const parcelsWithUserInfo = result.map(parcel => (Object.assign(Object.assign({}, parcel), { user: userMap[parcel.userId] })));
    return parcelsWithUserInfo;
});
const getParcelListByUserFromDb = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.parcel.findMany({
        where: {
            userId: userId,
        },
    });
    if (!result) {
        throw new Error('Parcel not found');
    }
    return result;
});
const updateParcelIntoDb = (userId, parcelId, parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { data, parcelImage } = parcelData;
    const updateData = Object.assign(Object.assign({}, data), { userId: userId });
    if (parcelImage !== undefined) {
        updateData.image = parcelImage;
    }
    if (data.endDateTime) {
        updateData.endDateTime = new Date(data.endDateTime);
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
    if (result.parcelStatus === client_1.ParcelStatus.DELIVERED) {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: (_a = result.deliveryPersonId) !== null && _a !== void 0 ? _a : undefined },
            select: { fcmToken: true, id: true },
        });
        console.log(user);
        if (user && user.fcmToken) {
            const notificationTitle = 'Parcel Received Successfully';
            const notificationBody = 'Your delivery parcel is Received Successfully';
            yield Notification_service_1.notificationService.sendNotification(user.fcmToken, notificationTitle, notificationBody, result.deliveryPersonId);
        }
    }
    return result;
});
const updateParcelToPickupIntoDb = (userId, parcelId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield prisma_1.default.parcel.update({
        where: {
            id: parcelId,
            deliveryPersonId: userId,
        },
        data: {
            parcelStatus: data.parcelStatus,
        },
    });
    if (!parcel) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Parcel not updated');
    }
    const user = yield prisma_1.default.user.findUnique({
        where: { id: parcel.userId },
        select: { fcmToken: true },
    });
    if (parcel.parcelStatus === client_1.ParcelStatus.DELIVERED) {
        const notificationTitle = 'Parcel Delivered Successfully';
        const notificationBody = 'Your parcel is Delivered to the destination';
        if (user && user.fcmToken) {
            yield Notification_service_1.notificationService.sendNotification(user.fcmToken, notificationTitle, notificationBody, parcel.userId);
        }
    }
    return parcel;
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
const updateParcelToAcceptIntoDb = (userId, parcelId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const parcel = yield prisma.parcel.findUnique({
            where: {
                id: parcelId,
            },
        });
        if (!parcel) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Parcel not found');
        }
        const updatedParcel = yield prisma.parcel.update({
            where: {
                id: parcelId,
            },
            data: {
                deliveryPersonId: userId,
                parcelStatus: data.parcelStatus,
            },
        });
        if (!updatedParcel) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'Parcel not updated');
        }
        const user = yield prisma.user.findUnique({
            where: { id: parcel.userId },
            select: { fcmToken: true },
        });
        if (updatedParcel.parcelStatus === client_1.ParcelStatus.ACCEPTED) {
            const notificationTitle = 'Parcel Accepted Successfully';
            const notificationBody = 'Your parcel is ready to pickup';
            if (user && user.fcmToken) {
                yield Notification_service_1.notificationService.sendNotification(user.fcmToken, notificationTitle, notificationBody, parcel.userId);
            }
        }
        return updatedParcel;
    }));
    return result;
});
exports.parcelService = {
    createParcelIntoDb,
    getParcelListFromDb,
    getParcelByIdFromDb,
    updateParcelIntoDb,
    deleteParcelItemFromDb,
    getParcelListByUserFromDb,
    getParcelListToPickupFromDb,
    updateParcelToPickupIntoDb,
    updateParcelToAcceptIntoDb,
};
