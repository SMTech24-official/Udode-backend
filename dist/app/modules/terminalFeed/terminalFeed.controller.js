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
exports.terminalFeedController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const terminalFeed_service_1 = require("./terminalFeed.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const multerUpload_1 = require("../../utils/multerUpload");
const updateMulterUpload_1 = require("../../utils/updateMulterUpload");
const createTerminalFeed = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = req.body;
    const file = req.file;
    if (!file) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'file not found');
    }
    const fileUrl = yield (0, multerUpload_1.uploadFileToSpace)(file, 'retire-professional');
    const terminalFeedData = {
        data,
        terminalFeedImage: fileUrl,
    };
    const result = yield terminalFeed_service_1.terminalFeedService.createTerminalFeedIntoDb(user.id, terminalFeedData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'TerminalFeed created successfully',
        data: result,
    });
}));
const getTerminalFeedList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield terminalFeed_service_1.terminalFeedService.getTerminalFeedListFromDb();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'TerminalFeed list retrieved successfully',
        data: result,
    });
}));
const getTerminalFeedById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield terminalFeed_service_1.terminalFeedService.getTerminalFeedByIdFromDb(user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'TerminalFeed details retrieved successfully',
        data: result,
    });
}));
const updateTerminalFeed = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const terminalFeedId = req.params.terminalFeedId;
    const user = req.user;
    const data = req.body;
    const file = req.file;
    let terminalFeedData = {
        data,
    };
    if (file) {
        const fileUrl = yield (0, updateMulterUpload_1.uploadFileToSpaceForUpdate)(file, 'retire-professional');
        terminalFeedData.terminalFeedImage = fileUrl;
    }
    const result = yield terminalFeed_service_1.terminalFeedService.updateTerminalFeedIntoDb(user.id, terminalFeedId, terminalFeedData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'TerminalFeed updated successfully',
        data: result,
    });
}));
const deleteTerminalFeed = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield terminalFeed_service_1.terminalFeedService.deleteTerminalFeedItemFromDb(user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'TerminalFeed deleted successfully',
        data: result,
    });
}));
exports.terminalFeedController = {
    createTerminalFeed,
    getTerminalFeedList,
    getTerminalFeedById,
    updateTerminalFeed,
    deleteTerminalFeed,
};
