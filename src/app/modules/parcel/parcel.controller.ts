import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { parcelService } from './parcel.service';
import AppError from '../../errors/AppError';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';

const createParcel = catchAsync(async (req, res) => {

  const user = req.user as any;
  const data = req.body;
  const file = req.file;
  if (!file) {
    throw new AppError(httpStatus.CONFLICT, 'file not found');
  }
  const fileUrl = await uploadFileToSpace(file, 'retire-professional');

  const parcelData = {
    data,
    parcelImage: fileUrl,
  };
  const result = await parcelService.createParcelIntoDb(user.id, parcelData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Parcel created successfully',
    data: result,
  });
});

const getParcelList = catchAsync(async (req, res) => {
  const result = await parcelService.getParcelListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel list retrieved successfully',
    data: result,
  });
});

const getParcelById = catchAsync(async (req, res) => {

  const user = req.user as any;
  const result = await parcelService.getParcelByIdFromDb(
    user.id,
    req.params.parcelId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel details retrieved successfully',
    data: result,
  });
});

const getParcelListByUser = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await parcelService.getParcelListByUserFromDb(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel list retrieved successfully',
    data: result,
  });
});

const updateParcel = catchAsync(async (req, res) => {
  const parcelId = req.params.parcelId;
  const user = req.user as any;
  const data = req.body;
  const file = req.file;

  let parcelData: { data: any; parcelImage?: string } = { data };

  if (file) {
    const fileUrl = await uploadFileToSpaceForUpdate(
      file,
      'retire-professional',
    );
    parcelData.parcelImage = fileUrl;
  }
  const result = await parcelService.updateParcelIntoDb(
    user.id,
    parcelId, 
    parcelData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel updated successfully',
    data: result,
  });
});

const deleteParcel = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await parcelService.deleteParcelItemFromDb(
    user.id,
    req.params.parcelId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel deleted successfully',
    data: result,
  });
});

export const parcelController = {
  createParcel,
  getParcelList,
  getParcelById,
  updateParcel,
  deleteParcel,
  getParcelListByUser,
};