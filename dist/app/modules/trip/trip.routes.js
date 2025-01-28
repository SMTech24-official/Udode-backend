"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const trip_controller_1 = require("./trip.controller");
const trip_validation_1 = require("./trip.validation");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(), (0, validateRequest_1.default)(trip_validation_1.tripValidation.createSchema), trip_controller_1.tripController.createTrip);
router.get('/', (0, auth_1.default)(), trip_controller_1.tripController.getTripList);
router.get('/user-trips', (0, auth_1.default)(), trip_controller_1.tripController.getTripListByUser);
router.get('/:tripId', (0, auth_1.default)(), trip_controller_1.tripController.getTripById);
router.put('/:tripId', (0, validateRequest_1.default)(trip_validation_1.tripValidation.updateSchema), (0, auth_1.default)(), trip_controller_1.tripController.updateTrip);
router.delete('/:tripId', (0, auth_1.default)(), trip_controller_1.tripController.deleteTrip);
exports.tripRoutes = router;
