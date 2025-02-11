import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { reviewService } from './review.service';

const createReview = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await reviewService.createReviewIntoDb(user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await reviewService.getReviewListFromDb(req.params.terminalId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review list retrieved successfully',
    data: result,
  });
});

const getReviewById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await reviewService.getReviewByIdFromDb(
    user.id,
    req.params.reviewId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review details retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await reviewService.updateReviewIntoDb(
    user.id,
    req.params.reviewId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await reviewService.deleteReviewItemFromDb(
    user.id,
    req.params.reviewId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const reviewController = {
  createReview,
  getReviewList,
  getReviewById,
  updateReview,
  deleteReview,
};