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
exports.parcelController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const parcel_service_1 = require("./parcel.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const multerUpload_1 = require("../../utils/multerUpload");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const createParcel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    if (!file) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(file, 'retire-professional');
    const parcelData = {
        data,
        parcelImage: fileUrl,
    };
    const result = yield parcel_service_1.parcelService.createParcelIntoDb(user.id, parcelData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Parcel created successfully',
        data: result,
    });
}));
const getParcelList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_service_1.parcelService.getParcelListFromDb();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel list retrieved successfully',
        data: result,
    });
}));
const getParcelById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield parcel_service_1.parcelService.getParcelByIdFromDb(user.id, req.params.parcelId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel details retrieved successfully',
        data: result,
    });
}));
const getParcelListByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield parcel_service_1.parcelService.getParcelListByUserFromDb(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel list retrieved successfully',
        data: result,
    });
}));
const getParcelListToPickup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield parcel_service_1.parcelService.getParcelListToPickupFromDb(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel list retrieved successfully',
        data: result,
    });
}));
const updateParcel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.parcelId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let parcelData = { data };
    if (file) {
        const fileUrl = yield (0, updateMulterUpload_1.uploadFileToSpaceForUpdate)(file, 'retire-professional');
        parcelData.parcelImage = fileUrl;
    }
    const result = yield parcel_service_1.parcelService.updateParcelIntoDb(user.id, parcelId, parcelData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel updated successfully',
        data: result,
    });
}));
const updateParcelToPickup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.parcelId;
    const user = req.user;
    const data = req.body;
    const result = yield parcel_service_1.parcelService.updateParcelToPickupIntoDb(user.id, parcelId, data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel updated successfully',
        data: result,
    });
}));
const deleteParcel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield parcel_service_1.parcelService.deleteParcelItemFromDb(user.id, req.params.parcelId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel deleted successfully',
        data: result,
    });
}));
const updateParcelToAccept = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.parcelId;
    const user = req.user;
    const data = req.body;
    const result = yield parcel_service_1.parcelService.updateParcelToAcceptIntoDb(user.id, parcelId, data);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Parcel updated successfully',
        data: result,
    });
}));
exports.parcelController = {
    createParcel,
    getParcelList,
    getParcelById,
    updateParcel,
    deleteParcel,
    getParcelListByUser,
    getParcelListToPickup,
    updateParcelToPickup,
    updateParcelToAccept,
};
