import { User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import { generateToken } from '../../utils/generateToken';
import emailSender from '../../utils/emailSender';
import Stripe from 'stripe';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2024-12-18.acacia',
});

const registerUserIntoDB = async (payload: any) => {
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'User already exists!');
    }
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  const userData = {
    ...payload,
    password: hashedPassword,
  };

  const result = await prisma.$transaction(async (transactionClient: any) => {
    const user = await transactionClient.user.create({
      data: userData,
    });
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not created!');
    }
  });

  // return login;
  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
  const otpExpiresAtString = otpExpiresAt.toISOString();

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      otp: otp,
      otpExpiry: otpExpiresAtString,
    },
  });

  await emailSender(
    'Verify Your Email',
    userData.email,

    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #32CD32; padding: 20px; text-align: center; color: #f5f5f5; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${
          userData.fullName
        }</strong>,</p>
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

      `,
  );
  return { message: 'OTP sent via your email successfully' };
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
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
};

const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
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
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
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
};

const updateMyProfileIntoDB = async (id: string, payload: any) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // update user data
  await prisma.$transaction(async (transactionClient: any) => {
    // Update user data
    const updatedUser = await transactionClient.user.update({
      where: { id },
      data: payload,
    });

    if (!updatedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not updated!');
    }

    return updatedUser;
  });

  // Fetch and return the updated user including the profile
  const updatedUser = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  const userWithOptionalPassword = updatedUser as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};

const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return result;
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password ? userData.password : '',
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
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
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.CONFLICT, 'User not found!');
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
  const otpExpiresAtString = otpExpiresAt.toISOString();

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      otp: otp,
      otpExpiry: otpExpiresAtString,
    },
  });
  if (!userData.email) {
    throw new AppError(httpStatus.CONFLICT, 'Email not set for this user');
  }

  await emailSender(
    'Verify Your Email',
    userData.email,

    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #32CD32; padding: 20px; text-align: center; color: #f5f5f5; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${
          userData.fullName
        }</strong>,</p>
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

      `,
  );

  return { message: 'OTP sent via your email successfully' };
};

// verify otp
const verifyOtpInDB = async (bodyData: {
  email: string;
  password: string;
  otp: number;
}) => {
  const userData = await prisma.user.findUnique({
    where: { email: bodyData.email },
  });

  if (!userData) {
    throw new AppError(httpStatus.CONFLICT, 'User not found!');
  }
  const currentTime = new Date(Date.now());

  if (userData?.otp !== bodyData.otp) {
    throw new AppError(httpStatus.CONFLICT, 'Your OTP is incorrect!');
  } else if (!userData.otpExpiry || userData.otpExpiry <= currentTime) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Your OTP is expired, please send new otp',
    );
  }

  if (userData.status !== UserStatus.ACTIVE) {
    await prisma.user.update({
      where: { email: bodyData.email },
      data: {
        otp: null,
        otpExpiry: null,
        status: UserStatus.ACTIVE,
      },
    });
  } else {
    await prisma.user.update({
      where: { email: bodyData.email },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });
  }
  if (!userData.email) {
    throw new AppError(httpStatus.CONFLICT, 'Email not set for this user');
  }
  return { message: 'OTP verified successfully!' };
};

// verify otp
const verifyOtpForgotPasswordInDB = async (bodyData: {
  email: string;
  password: string;
  otp: number;
}) => {
  const userData = await prisma.user.findUnique({
    where: { email: bodyData.email },
  });

  if (!userData) {
    throw new AppError(httpStatus.CONFLICT, 'User not found!');
  }
  const currentTime = new Date(Date.now());

  if (userData?.otp !== bodyData.otp) {
    throw new AppError(httpStatus.CONFLICT, 'Your OTP is incorrect!');
  } else if (!userData.otpExpiry || userData.otpExpiry <= currentTime) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Your OTP is expired, please send new otp',
    );
  }

  if (userData.status !== UserStatus.ACTIVE) {
    await prisma.user.update({
      where: { email: bodyData.email },
      data: {
        otp: null,
        otpExpiry: null,
        status: UserStatus.ACTIVE,
      },
    });
  } else {
    await prisma.user.update({
      where: { email: bodyData.email },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });
  }

  return { message: 'OTP verified successfully!' };
};

const socialLoginIntoDB = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        ...payload,
        status: UserStatus.ACTIVE,
      },
    });
    const accessToken = await generateToken(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );

    return { newUser, accessToken };
  }
  if (user) {
    const fcmUpdate = await prisma.user.update({
      where: { email: payload.email },
      data: {
        fcmToken: payload.fcmToken,
      },
    });
    const accessToken = await generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return { user, accessToken };
  }
};

const updatePasswordIntoDb = async (payload: any) => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  const hashedPassword: string = await bcrypt.hash(payload.password, 12);
  const result = await prisma.user.update({
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
};

const resendOtpIntoDB = async (payload: any) => {
  const userData = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }
  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
  const otpExpiresAtString = otpExpiresAt.toISOString();

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      otp: otp,
      otpExpiry: otpExpiresAtString,
    },
  });
  if (!userData.email) {
    throw new AppError(httpStatus.CONFLICT, 'Email not set for this user');
  }

  await emailSender(
    'Verify Your Email',
    userData.email,

    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #32CD32; padding: 20px; text-align: center; color: #f5f5f5; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Verify your email</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${
          userData.fullName
        }</strong>,</p>
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

      `,
  );

  return { message: 'OTP sent via your email successfully' };
};

const updateProfileImageIntoDB = async (
  userId: string,
  profileImageUrl: string,
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      image: profileImageUrl,
    },
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Profile image not updated!');
  }

  return updatedUser;
};


const getEarningsFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      stripeCustomerId: true,
    }
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.stripeCustomerId) {
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeCustomerId,
    });

    return balance;
  }

  return user;
};


const withdrawBalanceFromDB = async (userId: string, data: {
  amount: number;
}) => {

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      stripeCustomerId: true, // Use the connected account ID
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (!user.stripeCustomerId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'User does not have a connected Stripe account!',
    );
  }

  // Validate the amount (Stripe requires the smallest currency unit, e.g., cents for USD)
   const validAmount = Number(data.amount);
   if (isNaN(validAmount)) {
     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid amount provided!');
   }
   const transportPriceInKobo = Math.round(validAmount * 100); // Convert to Kobo

   console.log(transportPriceInKobo);
   if (transportPriceInKobo < 25000) {
     throw new AppError(
       httpStatus.BAD_REQUEST,
       'Minimum amount to be paid is 250',
     );
   }

  // Create a payout to the connected account's bank account
 
    const payout = await stripe.payouts.create(
      {
        amount: transportPriceInKobo, // Amount in cents (e.g., $10.00 = 1000)
        currency: 'ngn', // Ensure currency matches the connected account's balance
        method: 'instant', // Optional: 'instant' for faster payouts, incurs fees
      },
      {
        stripeAccount: user.stripeCustomerId, // Connected account ID
      },
    );
    if (!payout) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Payout failed!',
      );
    }

    return { message: 'Amount transferred successfully!', payout };
  
};


export const UserServices = {
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
