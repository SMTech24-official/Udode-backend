import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { tripService } from './trip.service';

const createTrip = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await tripService.createTripIntoDb(user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Trip created successfully',
    data: result,
  });
});

const getTripList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await tripService.getTripListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip list retrieved successfully',
    data: result,
  });
});

const getTripById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await tripService.getTripByIdFromDb(req.params.tripId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip details retrieved successfully',
    data: result,
  });
});

const updateTrip = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await tripService.updateTripIntoDb(
    user.id,
    req.params.tripId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip updated successfully',
    data: result,
  });
});

const deleteTrip = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await tripService.deleteTripItemFromDb(
    user.id,
    req.params.tripId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip deleted successfully',
    data: result,
  });
});

const getTripListByUser = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await tripService.getTripListByUserFromDb(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip list retrieved successfully',
    data: result,
  });
});

export const tripController = {
  createTrip,
  getTripList,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripListByUser,
};