import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const createDestinationIntoDb = async (
  userId: string,
  destinationData: any,
) => {
  console.log(destinationData)
  const { data, destinationImage } = destinationData;
  const result = await prisma.destination.create({
    data: {
      destinationName: data.destinationName,
      location: data.location? data.location : '',
      latitude: data.latitude,
      longitude: data.longitude,
      image: destinationImage,
      userId: userId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'destination not created');
  }
  return result;
};

const getDestinationListFromDb = async () => {
  
    const result = await prisma.destination.findMany();
    if (result.length === 0) {
    return { message: 'No destination found' };
  }
    return result;
};

const getDestinationByIdFromDb = async (destinationId: string) => {
  const result = await prisma.destination.findUnique({
    where: {
      id: destinationId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'destination not found');
  }
  return result;
};



const updateDestinationIntoDb = async (
  userId: string,
  destinationId: string,
  destinationData: any,
) => {
  const { data, destinationImage } = destinationData;
  const updateData: any = {
    ...data,
    userId: userId,
  };
  if (destinationImage !== undefined) {
    updateData.image = destinationImage;
  }
  const result = await prisma.destination.update({
    where: {
      id: destinationId,
      userId: userId,
    },
    data: {
      ...updateData,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'destinationId, not updated');
  }
  return result;
};

const deleteDestinationItemFromDb = async (
  userId: string,
  destinationId: string,
) => {
  const deletedItem = await prisma.destination.delete({
    where: {
      id: destinationId,
      userId: userId,
    },
  });
  if (!deletedItem) {
    throw new AppError(httpStatus.BAD_REQUEST, 'destinationId, not deleted');
  }

  return deletedItem;
};

export const destinationService = {
createDestinationIntoDb,
getDestinationListFromDb,
getDestinationByIdFromDb,
updateDestinationIntoDb,
deleteDestinationItemFromDb,
};