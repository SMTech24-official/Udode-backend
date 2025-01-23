import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createReviewIntoDb = async (userId: string, data: any) => {
  const result = await prisma.review.create({
    data: {
      ...data,
      userId: userId,
    },
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review not created');
  }
  return result;
};

const getReviewListFromDb = async (terminalId: string) => {
  const result = await prisma.review.findMany({
    where: {
      terminalId: terminalId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          image: true,
        },
      },
    },
  });
  if (result.length === 0) {
    return { message: 'Review not found' };
  }
  return result;
};

const getReviewByIdFromDb = async (userId: string, reviewId: string) => {
  const result = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
  }
  return result;
};

const updateReviewIntoDb = async (
  userId: string,
  reviewId: string,
  data: any,
) => {
  const result = await prisma.review.update({
    where: {
      id: reviewId,
      userId: userId,
    },
    data: {
      comment: data.comment,
      rating: data.rating,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review not updated');
  }
  return result;
};

const deleteReviewItemFromDb = async (userId: string, reviewId: string) => {
  const deletedItem = await prisma.review.delete({
    where: {
      id: reviewId,
      userId: userId,
    },
  });
  if(!deletedItem) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Review not deleted');
  }

  return deletedItem;
};

export const reviewService = {
  createReviewIntoDb,
  getReviewListFromDb,
  getReviewByIdFromDb,
  updateReviewIntoDb,
  deleteReviewItemFromDb,
};
