"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const terminal_controller_1 = require("./terminal.controller");
const terminal_validation_1 = require("./terminal.validation");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(terminal_validation_1.terminalValidation.createSchema), terminal_controller_1.terminalController.createTerminal);
router.get('/', (0, auth_1.default)(), terminal_controller_1.terminalController.getTerminalList);
router.get('/:id', (0, auth_1.default)(), terminal_controller_1.terminalController.getTerminalById);
router.put('/:id', (0, auth_1.default)(), (0, validateRequest_1.default)(terminal_validation_1.terminalValidation.updateSchema), terminal_controller_1.terminalController.updateTerminal);
router.delete('/:id', (0, auth_1.default)(), terminal_controller_1.terminalController.deleteTerminal);
exports.terminalRoutes = router;
