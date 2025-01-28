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
exports.destinationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const destination_service_1 = require("./destination.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const multerUpload_1 = require("../../utils/multerUpload");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const createDestination = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    if (!file) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(file, 'retire-professional');
    const destinationData = {
        data,
        destinationImage: fileUrl,
    };
    const result = yield destination_service_1.destinationService.createDestinationIntoDb(user.id, destinationData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Destination created successfully',
        data: result,
    });
}));
const getDestinationList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield destination_service_1.destinationService.getDestinationListFromDb();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Destination list retrieved successfully',
        data: result,
    });
}));
const getDestinationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield destination_service_1.destinationService.getDestinationByIdFromDb(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Destination details retrieved successfully',
        data: result,
    });
}));
const updateDestination = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const destinationId = req.params.destinationId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let destinationData = {
        data,
    };
    if (file) {
        const fileUrl = yield (0, updateMulterUpload_1.uploadFileToSpaceForUpdate)(file, 'retire-professional');
        destinationData.destinationImage = fileUrl;
    }
    const result = yield destination_service_1.destinationService.updateDestinationIntoDb(user.id, destinationId, destinationData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Destination updated successfully',
        data: result,
    });
}));
const deleteDestination = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield destination_service_1.destinationService.deleteDestinationItemFromDb(user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Destination deleted successfully',
        data: result,
    });
}));
exports.destinationController = {
    createDestination,
    getDestinationList,
    getDestinationById,
    updateDestination,
    deleteDestination,
};
