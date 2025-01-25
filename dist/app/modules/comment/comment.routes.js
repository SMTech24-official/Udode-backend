"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const comment_controller_1 = require("./comment.controller");
const comment_validation_1 = require("./comment.validation");
const router = express_1.default.Router();
router.post('/', (0, validateRequest_1.default)(comment_validation_1.commentValidation.createSchema), (0, auth_1.default)(), comment_controller_1.commentController.createComment);
router.post('/reply', (0, validateRequest_1.default)(comment_validation_1.commentValidation.updateSchema), (0, auth_1.default)(), comment_controller_1.commentController.replyCommentByTripId);
router.get('/:tripId', (0, auth_1.default)(), comment_controller_1.commentController.getCommentList);
router.put('/:commentId', (0, validateRequest_1.default)(comment_validation_1.commentValidation.updateSchema), (0, auth_1.default)(), comment_controller_1.commentController.updateComment);
router.delete('/:commentId', (0, auth_1.default)(), comment_controller_1.commentController.deleteComment);
exports.commentRoutes = router;
