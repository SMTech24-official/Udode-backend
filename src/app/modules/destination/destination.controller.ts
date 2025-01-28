import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { destinationService } from './destination.service';
import AppError from '../../errors/AppError';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';

const createDestination = catchAsync(async (req, res) => {
  const user = req.user as any;
  const data = req.body;
  const file = req.file;
  if (!file) {
    throw new AppError(httpStatus.CONFLICT, 'file not found');
  }
  const fileUrl = await uploadFileToSpace(file, 'retire-professional');

  const destinationData = {
    data,
    destinationImage: fileUrl,
  };
  const result = await destinationService.createDestinationIntoDb(
    user.id,
    destinationData,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Destination created successfully',
    data: result,
  });
});

const getDestinationList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await destinationService.getDestinationListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Destination list retrieved successfully',
    data: result,
  });
});

const getDestinationById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await destinationService.getDestinationByIdFromDb(
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Destination details retrieved successfully',
    data: result,
  });
});

const updateDestination = catchAsync(async (req, res) => {
  const destinationId = req.params.destinationId;
  const user = req.user as any;
  const data = req.body;
  const file = req.file;

  let destinationData: { data: any; destinationImage?: string } = {
    data,
  };

  if (file) {
    const fileUrl = await uploadFileToSpaceForUpdate(
      file,
      'retire-professional',
    );
    destinationData.destinationImage = fileUrl;
  }
  const result = await destinationService.updateDestinationIntoDb(
    user.id,
    destinationId,
    destinationData,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Destination updated successfully',
    data: result,
  });
});

const deleteDestination = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await destinationService.deleteDestinationItemFromDb(
    user.id,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Destination deleted successfully',
    data: result,
  });
});

export const destinationController = {
  createDestination,
  getDestinationList,
  getDestinationById,
  updateDestination,
  deleteDestination,
};
