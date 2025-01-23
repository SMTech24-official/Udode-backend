import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { terminalFeedService } from './terminalFeed.service';
import AppError from '../../errors/AppError';
import { uploadFileToSpace } from '../../utils/multerUpload';
import { uploadFileToSpaceForUpdate } from '../../utils/updateMulterUpload';

const createTerminalFeed = catchAsync(async (req, res) => {
  
  const user = req.user as any;
  const data = req.body;
  const file = req.file;
  if (!file) {
    throw new AppError(httpStatus.CONFLICT, 'file not found');
  }
  const fileUrl = await uploadFileToSpace(file, 'retire-professional');

  const terminalFeedData = {
    data,
    terminalFeedImage: fileUrl,
  };
  const result = await terminalFeedService.createTerminalFeedIntoDb(
    user.id,
    terminalFeedData,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'TerminalFeed created successfully',
    data: result,
  });
});

const getTerminalFeedList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalFeedService.getTerminalFeedListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TerminalFeed list retrieved successfully',
    data: result,
  });
});

const getTerminalFeedById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalFeedService.getTerminalFeedByIdFromDb(
    user.id,
    req.params.terminalFeedId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TerminalFeed details retrieved successfully',
    data: result,
  });
});

const updateTerminalFeed = catchAsync(async (req, res) => {
   const terminalFeedId = req.params.terminalFeedId;
   const user = req.user as any;
   const data = req.body;
   const file = req.file;
 
   let terminalFeedData: { data: any; terminalFeedImage?: string } = {
     data,
   };
 
   if (file) {
     const fileUrl = await uploadFileToSpaceForUpdate(
       file,
       'retire-professional',
     );
     terminalFeedData.terminalFeedImage = fileUrl;
   }
  const result = await terminalFeedService.updateTerminalFeedIntoDb(
    user.id,
    terminalFeedId,
    terminalFeedData,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TerminalFeed updated successfully',
    data: result,
  });
});

const deleteTerminalFeed = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalFeedService.deleteTerminalFeedItemFromDb(
    user.id,
    req.params.terminalFeedId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'TerminalFeed deleted successfully',
    data: result,
  });
});

export const terminalFeedController = {
  createTerminalFeed,
  getTerminalFeedList,
  getTerminalFeedById,
  updateTerminalFeed,
  deleteTerminalFeed,
};