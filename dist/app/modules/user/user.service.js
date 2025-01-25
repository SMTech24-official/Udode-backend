"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.UserServices = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const generateToken_1 = require("../../utils/generateToken");
const emailSender_1 = __importDefault(require("../../utils/emailSender"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(config_1.default.stripe.stripe_secret_key, {
    apiVersion: '2024-12-18.acacia',
});
const registerUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.email) {
        const existingUser = yield prisma_1.default.user.findUnique({
            where: {
                email: payload.email,
            },
        });
        if (existingUser) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists!');
        }
    }
    const hashedPassword = yield bcrypt.hash(payload.password, 12);
    const userData = Object.assign(Object.assign({}, payload), { password: hashedPassword });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield transactionClient.user.create({
            data: userData,
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not created!');
        }
    }));
    // return login;
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
    const otpExpiresAtString = otpExpiresAt.toISOString();
    yield prisma_1.default.user.update({
        where: { email: payload.email },
        data: {
            otp: otp,
            otpExpiry: otpExpiresAtString,
        },
    });
    yield (0, emailSender_1.default)('Verify Your Email', userData.email, `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #32CD32; padding: 20px; text-align: center; color: #f5f5f5; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${userData.fullName}</strong>,</p>
        <p style="font-size: 16px;">Please verify your email.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px;" >Verify email using this OTP: <span style="font-weight:bold"> ${otp} </span><br/> This OTP will be Expired in 5 minutes,</p>
        </div>
        <p style="font-size: 14px; color: #555;">If you did not request this change, please ignore this email. No further action is needed.</p>
        <p style="font-size: 16px; margin-top: 20px;">Thank you,<br>IYARGO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} IYARGO Team. All rights reserved.</p>
      </td>
    </tr>
    </table>
  </div>

      `);
    return { message: 'OTP sent via your email successfully' };
});
const getAllUsersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return result;
});
const getMyProfileFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const Profile = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: id,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            phone: true,
            image: true,
            status: true,
            location: true,
            isVerified: true,
        },
    });
    return Profile;
});
const getUserDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: { id },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
});
const updateMyProfileIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: { id },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    // update user data
    yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Update user data
        const updatedUser = yield transactionClient.user.update({
            where: { id },
            data: payload,
        });
        if (!updatedUser) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not updated!');
        }
        return updatedUser;
    }));
    // Fetch and return the updated user including the profile
    const updatedUser = yield prisma_1.default.user.findUniqueOrThrow({
        where: { id },
    });
    const userWithOptionalPassword = updatedUser;
    delete userWithOptionalPassword.password;
    return userWithOptionalPassword;
});
const updateUserRoleStatusIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.update({
        where: {
            id: id,
        },
        data: payload,
    });
    return result;
});
const changePassword = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    const isCorrectPassword = yield bcrypt.compare(payload.oldPassword, userData.password ? userData.password : '');
    if (!isCorrectPassword) {
        throw new Error('Password incorrect!');
    }
    const hashedPassword = yield bcrypt.hash(payload.newPassword, 12);
    yield prisma_1.default.user.update({
        where: {
            id: userData.id,
        },
        data: {
            password: hashedPassword,
        },
    });
    return {
        message: 'Password changed successfully!',
    };
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User not found!');
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
    const otpExpiresAtString = otpExpiresAt.toISOString();
    yield prisma_1.default.user.update({
        where: { email: payload.email },
        data: {
            otp: otp,
            otpExpiry: otpExpiresAtString,
        },
    });
    if (!userData.email) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Email not set for this user');
    }
    yield (0, emailSender_1.default)('Verify Your Email', userData.email, `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #32CD32; padding: 20px; text-align: center; color: #f5f5f5; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${userData.fullName}</strong>,</p>
        <p style="font-size: 16px;">Please verify your email.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px;" >Verify email using this OTP: <span style="font-weight:bold"> ${otp} </span><br/> This OTP will be Expired in 5 minutes,</p>
        </div>
        <p style="font-size: 14px; color: #555;">If you did not request this change, please ignore this email. No further action is needed.</p>
        <p style="font-size: 16px; margin-top: 20px;">Thank you,<br>IYARGO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} IYARGO Team. All rights reserved.</p>
      </td>
    </tr>
    </table>
  </div>

      `);
    return { message: 'OTP sent via your email successfully' };
});
// verify otp
const verifyOtpInDB = (bodyData) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: bodyData.email },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User not found!');
    }
    const currentTime = new Date(Date.now());
    if ((userData === null || userData === void 0 ? void 0 : userData.otp) !== bodyData.otp) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Your OTP is incorrect!');
    }
    else if (!userData.otpExpiry || userData.otpExpiry <= currentTime) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Your OTP is expired, please send new otp');
    }
    if (userData.status !== client_1.UserStatus.ACTIVE) {
        yield prisma_1.default.user.update({
            where: { email: bodyData.email },
            data: {
                otp: null,
                otpExpiry: null,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    }
    else {
        yield prisma_1.default.user.update({
            where: { email: bodyData.email },
            data: {
                otp: null,
                otpExpiry: null,
            },
        });
    }
    if (!userData.email) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Email not set for this user');
    }
    return { message: 'OTP verified successfully!' };
});
// verify otp
const verifyOtpForgotPasswordInDB = (bodyData) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: bodyData.email },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User not found!');
    }
    const currentTime = new Date(Date.now());
    if ((userData === null || userData === void 0 ? void 0 : userData.otp) !== bodyData.otp) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Your OTP is incorrect!');
    }
    else if (!userData.otpExpiry || userData.otpExpiry <= currentTime) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Your OTP is expired, please send new otp');
    }
    if (userData.status !== client_1.UserStatus.ACTIVE) {
        yield prisma_1.default.user.update({
            where: { email: bodyData.email },
            data: {
                otp: null,
                otpExpiry: null,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    }
    else {
        yield prisma_1.default.user.update({
            where: { email: bodyData.email },
            data: {
                otp: null,
                otpExpiry: null,
            },
        });
    }
    return { message: 'OTP verified successfully!' };
});
const socialLoginIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        const newUser = yield prisma_1.default.user.create({
            data: Object.assign(Object.assign({}, payload), { status: client_1.UserStatus.ACTIVE }),
        });
        const accessToken = yield (0, generateToken_1.generateToken)({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
        }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
        return { newUser, accessToken };
    }
    if (user) {
        const fcmUpdate = yield prisma_1.default.user.update({
            where: { email: payload.email },
            data: {
                fcmToken: payload.fcmToken,
            },
        });
        const accessToken = yield (0, generateToken_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
        }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
        return { user, accessToken };
    }
});
const updatePasswordIntoDb = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    const hashedPassword = yield bcrypt.hash(payload.password, 12);
    const result = yield prisma_1.default.user.update({
        where: {
            email: payload.email,
        },
        data: {
            password: hashedPassword,
        },
    });
    return {
        message: 'Password updated successfully!',
    };
});
const resendOtpIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
    const otpExpiresAtString = otpExpiresAt.toISOString();
    yield prisma_1.default.user.update({
        where: { email: payload.email },
        data: {
            otp: otp,
            otpExpiry: otpExpiresAtString,
        },
    });
    if (!userData.email) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'Email not set for this user');
    }
    yield (0, emailSender_1.default)('Verify Your Email', userData.email, `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #32CD32; padding: 20px; text-align: center; color: #f5f5f5; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${userData.fullName}</strong>,</p>
        <p style="font-size: 16px;">Please verify your email.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px;" >Verify email using this OTP: <span style="font-weight:bold"> ${otp} </span><br/> This OTP will be Expired in 5 minutes,</p>
        </div>
        <p style="font-size: 14px; color: #555;">If you did not request this change, please ignore this email. No further action is needed.</p>
        <p style="font-size: 16px; margin-top: 20px;">Thank you,<br>IYARGO</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} IYARGO Team. All rights reserved.</p>
      </td>
    </tr>
    </table>
  </div>

      `);
    return { message: 'OTP sent via your email successfully' };
});
const updateProfileImageIntoDB = (userId, profileImageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: userId },
        data: {
            image: profileImageUrl,
        },
    });
    if (!updatedUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Profile image not updated!');
    }
    return updatedUser;
});
const getEarningsFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            stripeCustomerId: true,
        }
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (user.stripeCustomerId) {
        const balance = yield stripe.balance.retrieve({
            stripeAccount: user.stripeCustomerId,
        });
        return balance;
    }
    return user;
});
const withdrawBalanceFromDB = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            stripeCustomerId: true, // Use the connected account ID
        },
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    if (!user.stripeCustomerId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User does not have a connected Stripe account!');
    }
    // Validate the amount (Stripe requires the smallest currency unit, e.g., cents for USD)
    const validAmount = Number(data.amount);
    if (isNaN(validAmount)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid amount provided!');
    }
    const transportPriceInKobo = Math.round(validAmount * 100); // Convert to Kobo
    console.log(transportPriceInKobo);
    if (transportPriceInKobo < 25000) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Minimum amount to be paid is 250');
    }
    // Create a payout to the connected account's bank account
    const payout = yield stripe.payouts.create({
        amount: transportPriceInKobo, // Amount in cents (e.g., $10.00 = 1000)
        currency: 'ngn', // Ensure currency matches the connected account's balance
        method: 'instant', // Optional: 'instant' for faster payouts, incurs fees
    }, {
        stripeAccount: user.stripeCustomerId, // Connected account ID
    });
    if (!payout) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Payout failed!');
    }
    return { message: 'Amount transferred successfully!', payout };
});
exports.UserServices = {
    registerUserIntoDB,
    getAllUsersFromDB,
    getMyProfileFromDB,
    getUserDetailsFromDB,
    updateMyProfileIntoDB,
    updateUserRoleStatusIntoDB,
    changePassword,
    forgotPassword,
    verifyOtpInDB,
    verifyOtpForgotPasswordInDB,
    socialLoginIntoDB,
    updatePasswordIntoDb,
    resendOtpIntoDB,
    updateProfileImageIntoDB,
    getEarningsFromDB,
    withdrawBalanceFromDB,
};
