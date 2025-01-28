import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { UserServices } from '../user/user.service';
import AppError from '../../errors/AppError';
import { uploadFileToSpace } from '../../utils/multerUpload';

const registerUser = catchAsync(async (req, res) => {

  const result = await UserServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Users Retrieve successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.getMyProfileFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.updateMyProfileIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User profile updated successfully',
    data: result,
  });
});

const getUserDetails = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.getUserDetailsFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User details retrieved successfully',
    data: result,
  });
});



const updateUserRoleStatus = catchAsync(async (req, res) => {
const user = req.user as any;
  const result = await UserServices.updateUserRoleStatusIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await UserServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Please check your email to get the otp!',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req, res) => {
  const result = await UserServices.verifyOtpInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully!',
    data: result,
  });
});

const verifyOtpForgotPassword = catchAsync(async (req, res) => {
  const result = await UserServices.verifyOtpForgotPasswordInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully!',
    data: result,
  });
});


const socialLogin = catchAsync(async (req, res) => {
  const result = await UserServices.socialLoginIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result,
  });
});

const updatePassword = catchAsync(async (req, res) => {
  const result = await UserServices.updatePasswordIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const result = await UserServices.resendOtpIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully!',
    data: result,
  });
});

const updateProfileImage = catchAsync(async (req, res) => {
  const user = req.user as any;
  const file = req.file;

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, 'file not found');
  }
  let fileUrl = '';
  if (file) {
    fileUrl = await uploadFileToSpace(file, 'retire-professional');
  }
  const result = await UserServices.updateProfileImageIntoDB(user.id, fileUrl);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile image updated successfully',
    data: result,
  });
});

const getEarnings = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.getEarningsFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Earnings retrieved successfully',
    data: result,
  });
});

const withdrawBalance = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await UserServices.withdrawBalanceFromDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Withdraw request submitted successfully',
    data: result,
  });
});

const uploadIdProof = catchAsync(async (req, res) => {
  const user = req.user as any;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.frontIdCard || !files.backIdCard) {
    throw new AppError(httpStatus.NOT_FOUND, 'Files not found');
  }

  const frontIdCardFile = files.frontIdCard[0];
  const backIdCardFile = files.backIdCard[0];

  const frontIdCardUrl = await uploadFileToSpace(
    frontIdCardFile,
    'retire-professional',
  );
  const backIdCardUrl = await uploadFileToSpace(
    backIdCardFile,
    'retire-professional',
  );

  const result = await UserServices.uploadIdProofIntoDB(
    user.id,
    frontIdCardUrl,
    backIdCardUrl,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'ID proof uploaded successfully',
    data: result,
  });
});


export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  getUserDetails,
  updateUserRoleStatus,
  changePassword,
  verifyOtpForgotPassword,
  forgotPassword,
  verifyOtp,
  socialLogin,
  updatePassword,
  resendOtp,
  updateProfileImage,
  updateMyProfile,
  getEarnings,
  withdrawBalance,
  uploadIdProof,
};
