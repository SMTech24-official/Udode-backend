"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(category_validation_1.categoryValidation.createSchema), category_controller_1.categoryController.createCategory);
router.get('/', (0, auth_1.default)(), category_controller_1.categoryController.getCategoryList);
router.get('/:id', (0, auth_1.default)(), category_controller_1.categoryController.getCategoryById);
router.put('/:id', (0, auth_1.default)(), (0, validateRequest_1.default)(category_validation_1.categoryValidation.updateSchema), category_controller_1.categoryController.updateCategory);
router.delete('/:id', (0, auth_1.default)(), category_controller_1.categoryController.deleteCategory);
exports.categoryRoutes = router;
