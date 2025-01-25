import prisma from '../../utils/prisma';
import {
  ParcelStatus,
  PaymentStatus,
  UserRoleEnum,
  UserStatus,
} from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createParcelIntoDb = async (userId: string, parcelData: any) => {
  const { data, parcelImage } = parcelData;

  const result = await prisma.parcel.create({
    data: {
      description: data.description,
      from: data.from,
      to: data.to,
      phone: data.phone,
      parcelTransportPrice: data.parcelTransportPrice,
      emergencyNote : data.emergencyNote,
      image: parcelImage,
      userId: userId,
      endDateTime: new Date(data.endDateTime),
      parcelStatus: ParcelStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Parcel not created');
  }
  return result;
};

const getParcelListFromDb = async () => {
  const result = await prisma.parcel.findMany({
    where: {
      parcelStatus: ParcelStatus.PENDING,
    },
  });
  if (result.length === 0) {
    return { message: 'Parcel not found' };
  }
  const userIds = result.map(parcel => parcel.userId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      image: true,
      fullName: true,
      location: true,
    },
  });
  const userMap: Record<string, typeof users[0]> = users.reduce((acc: Record<string, typeof users[0]>, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  const parcelsWithUserInfo = result.map(parcel => ({
    ...parcel,
    user: userMap[parcel.userId],
  }));

  return parcelsWithUserInfo;
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
  const user = await prisma.user.findUnique({
    where: {
      id: result.userId,
    },
    select: {
      id: true,
      image: true,
      fullName: true,
      location: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const parcelWithUser = {
    ...result,
    user: user,
  };
  return parcelWithUser;
};

const getParcelListToPickupFromDb = async (userId: string) => {
  const result = await prisma.parcel.findMany({
    where: {
      deliveryPersonId: userId,
    },
    select: {
      id: true,
      description: true,
      from: true,
      to: true,
      phone: true,
      parcelTransportPrice: true,
      emergencyNote: true,
      image: true,
      userId: true,
      endDateTime: true,
      parcelStatus: true,
      paymentStatus: true,
    },
  });

  const userIds = result.map(parcel => parcel.userId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      fullName: true,
      image: true,
      location: true,
    },
  });

  const userMap: Record<string, typeof users[0]> = users.reduce((acc: Record<string, typeof users[0]>, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  const parcelsWithUserInfo = result.map(parcel => ({
    ...parcel,
    user: userMap[parcel.userId],
  }));

  return parcelsWithUserInfo;
};

const getParcelListByUserFromDb = async (userId: string) => {
  const result = await prisma.parcel.findMany({
    where: {
      userId: userId,
    },
  });
  if (!result) {
    throw new Error('Parcel not found');
  }
  return result;
};

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
    data: {
      ...updateData,
      endDateTime: new Date(data.endDateTime),
    },
  });

  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Parcel not updated');
  }
  return result;
};

const updateParcelToPickupIntoDb = async (  
  userId: string,
  parcelId: string,
   data: any ,
) => {
  const result = await prisma.parcel.update({
    where: {
      id: parcelId,
      deliveryPersonId: userId,   },
    data: {
      parcelStatus: data.parcelStatus,
    },
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

const updateParcelToAcceptIntoDb = async (
  userId: string,
  parcelId: string,
  data: any,
) => {
  const parcel = await prisma.parcel.findUnique({
    where: {
      id: parcelId,
    },
  });
  if(parcel?.deliveryPersonId !== userId) {
  const result = await prisma.parcel.update({
    where: {
      id: parcelId,
    },
    data: {
      deliveryPersonId: userId,
      parcelStatus: data.parcelStatus,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.CONFLICT, 'Parcel not updated');
  }

  return result;
}
else {
  throw new AppError(httpStatus.CONFLICT, 'Parcel not updated');
}
} ;

export const parcelService = {
  createParcelIntoDb,
  getParcelListFromDb,
  getParcelByIdFromDb,
  updateParcelIntoDb,
  deleteParcelItemFromDb,
  getParcelListByUserFromDb,
  getParcelListToPickupFromDb,
  updateParcelToPickupIntoDb,
  updateParcelToAcceptIntoDb,
};
