import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { commentService } from './comment.service';

const createComment = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.createCommentIntoDb(user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

const getCommentList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.getCommentListFromDb(req.params.tripId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment list retrieved successfully',
    data: result,
  });
});



const getCommentById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.getCommentByIdFromDb(
    req.params.commentId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment details retrieved successfully',
    data: result,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.updateCommentIntoDb(
    user.id,
    req.params.commentId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.deleteCommentItemFromDb(
    user.id,
    req.params.commentId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment and replies deleted successfully',
    data: result,
  });
});


const replyCommentByTripId = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.replyCommentByTripIdFromDb(
    user.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment replied successfully',
    data: result,
  });
});

const getAllCommentByTripId = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await commentService.getAllCommentByTripIdFromDb(
    req.params.tripId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All comments retrieved successfully',
    data: result,
  });
});

export const commentController = {
  createComment,
  getCommentList,
  getCommentById,
  updateComment,
  deleteComment,
  replyCommentByTripId,
  getAllCommentByTripId,
};