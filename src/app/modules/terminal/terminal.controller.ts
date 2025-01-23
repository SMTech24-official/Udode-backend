import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { terminalService } from './terminal.service';

const createTerminal = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalService.createTerminalIntoDb(user.id,req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Terminal created successfully',
    data: result,
  });
});

const getTerminalList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const { rating, fareRange, search } = req.query;

  const filters = {
    rating: rating ? Number(rating) : undefined,
    fareRange: fareRange as string,
    search: search as string,
  };

  const result = await terminalService.getTerminalListFromDb(filters);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terminal list retrieved successfully',
    data: result,
  });
});

const getTerminalById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalService.getTerminalByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terminal details retrieved successfully',
    data: result,
  });
});

const updateTerminal = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalService.updateTerminalIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terminal updated successfully',
    data: result,
  });
});

const deleteTerminal = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await terminalService.deleteTerminalItemFromDb(user.id, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terminal deleted successfully',
    data: result,
  });
});

export const terminalController = {
  createTerminal,
  getTerminalList,
  getTerminalById,
  updateTerminal,
  deleteTerminal,
};