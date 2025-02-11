"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouters = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("../user/user.validation");
const user_controller_1 = require("../user/user.controller");
const client_1 = require("@prisma/client");
const multerUpload_1 = require("../../utils/multerUpload");
const multipleFile_1 = require("../../utils/multipleFile");
const router = express_1.default.Router();
router.post('/register', (0, validateRequest_1.default)(user_validation_1.UserValidations.registerUser), user_controller_1.UserControllers.registerUser);
router.get('/', user_controller_1.UserControllers.getAllUsers);
router.get('/me', (0, auth_1.default)(), user_controller_1.UserControllers.getMyProfile);
router.get('/earnings', (0, auth_1.default)(), user_controller_1.UserControllers.getEarnings);
router.get('/:id', user_controller_1.UserControllers.getUserDetails);
router.put('/update-profile', (0, auth_1.default)(), user_controller_1.UserControllers.updateMyProfile);
router.put('/update-user/:id', (0, auth_1.default)(client_1.UserRoleEnum.ADMIN), user_controller_1.UserControllers.updateUserRoleStatus);
router.put('/change-password', (0, auth_1.default)(), user_controller_1.UserControllers.changePassword);
router.post('/forgot-password', (0, validateRequest_1.default)(user_validation_1.UserValidations.forgetPasswordSchema), user_controller_1.UserControllers.forgotPassword);
router.post('/resend-otp', user_controller_1.UserControllers.resendOtp);
router.put('/verify-otp', (0, validateRequest_1.default)(user_validation_1.UserValidations.verifyOtpSchema), user_controller_1.UserControllers.verifyOtp);
router.put('/verify-otp-forgot-password', (0, validateRequest_1.default)(user_validation_1.UserValidations.verifyOtpSchema), user_controller_1.UserControllers.verifyOtpForgotPassword);
router.put('/update-password', user_controller_1.UserControllers.updatePassword);
router.post('/social-sign-up', (0, validateRequest_1.default)(user_validation_1.UserValidations.socialLoginSchema), user_controller_1.UserControllers.socialLogin);
router.post('/withdraw', (0, auth_1.default)(), user_controller_1.UserControllers.withdrawBalance);
router.put('/update-profile-image', multerUpload_1.multerUpload.single('profileImage'), (0, auth_1.default)(), user_controller_1.UserControllers.updateProfileImage);
router.put('/id-proof', multipleFile_1.multerUploadMultiple.fields([
    { name: 'frontIdCard', maxCount: 1 },
    { name: 'backIdCard', maxCount: 1 },
]), (0, auth_1.default)(), user_controller_1.UserControllers.uploadIdProof);
exports.UserRouters = router;
