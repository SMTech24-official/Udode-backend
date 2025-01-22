import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createParcelIntoDb = async (userId: string, parcelData: any) => {
  const { data, parcelImage } = parcelData;
  const result = await prisma.parcel.create({
    data: {
      ...data,
      image: parcelImage,
      userId: userId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Parcel not created');
  }
  return result;
};

const getParcelListFromDb = async () => {
  const result = await prisma.parcel.findMany();
  if (result.length === 0) {
    return { message: 'Parcel not found' };
  }
  return result;
};

const getParcelByIdFromDb = async (userId: string, parcelId: string) => {
  const result = await prisma.parcel.findUnique({
    where: {
      id: parcelId,
    },
  });
  if (!result) {
    throw new Error('Parcel not found');
  }
  return result;
};

const getParcelListByUserFromDb = async (userId: string) => {
  const result = await prisma.parcel.findMany({
    where: {
      OR: [
        {
          userId: userId,
        },
        {
          deliveryPersonId: userId,
        }
      ],
    },
  });
  if (!result) {
    throw new Error('Parcel not found');
  }
  return result;
}

const updateParcelIntoDb = async (
  userId: string,
  parcelId: string,
  parcelData: { data: any; parcelImage?: string },
) => {
  const { data, parcelImage } = parcelData;
  const updateData: any = {
    ...data,
    userId: userId,
  };

  if (parcelImage !== undefined) {
    updateData.image = parcelImage;
  }

  const result = await prisma.parcel.update({
    where: {
      id: parcelId,
    },
    data: updateData,
  });

  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Parcel not updated');
  }
  return result;
};

const deleteParcelItemFromDb = async (userId: string, parcelId: string) => {
  const deletedItem = await prisma.parcel.delete({
    where: {
      id: parcelId,
      userId: userId,
    },
  });
  if (!deletedItem) {
    throw new AppError(httpStatus.CONFLICT, 'Parcel not deleted');
  }
  return deletedItem;
};
export const parcelService = {
  createParcelIntoDb,
  getParcelListFromDb,
  getParcelByIdFromDb,
  updateParcelIntoDb,
  deleteParcelItemFromDb,
  getParcelListByUserFromDb,
};
