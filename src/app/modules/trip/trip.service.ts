import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createTripIntoDb = async (userId: string, data: any) => {
  const result = await prisma.trip.create({
    data: {
      ...data,
      userId: userId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Trip not created');
  }
  return result;
};

const getTripListFromDb = async () => {
  const result = await prisma.trip.findMany();
  if (result.length === 0) {
    return { message: 'Trip not found' };
  }
  return result;
};

const getTripByIdFromDb = async (tripId: string) => {
  const result = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
  });
  if (!result) {
    throw new Error('Trip not found');
  }
  return result;
};

const updateTripIntoDb = async (userId: string, tripId: string, data: any) => {
  const result = await prisma.trip.update({
    where: {
      id: tripId,
      userId: userId,
    },
    data,
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_MODIFIED, 'Trip not updated');
  }
  return result;
};

const deleteTripItemFromDb = async (userId: string, tripId: string) => {
  const deletedItem = await prisma.trip.delete({
    where: {
      id: tripId,
      userId: userId,
    },
  });

  return deletedItem;
};

export const tripService = {
  createTripIntoDb,
  getTripListFromDb,
  getTripByIdFromDb,
  updateTripIntoDb,
  deleteTripItemFromDb,
};
