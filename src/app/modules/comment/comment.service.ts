import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const createCommentIntoDb = async (userId: string, data: any) => {

    const result = await prisma.comment.create({ 
      data: {
        ...data,
        userId: userId,
      }
     });
    return result;
  }

const getCommentListFromDb = async () => {
  
    const result = await prisma.comment.findMany();
    if (result.length === 0) {
      return { message: 'Comment not found' };
    }
    return result;
};

const getCommentByIdFromDb = async (tripId: string) => {

  const result = await prisma.comment.findUnique({ 
    where: { 
      id : tripId,
    } 
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return result;
};



const updateCommentIntoDb = async (userId: string, tripId: string, data: any) => {
    const result = await prisma.comment.update({
      where: { 
        id : tripId,
        userId: userId,
      },
      data,
    });
    if (!result) {
      throw new AppError(httpStatus.NOT_MODIFIED, 'Comment not updated');
    }
    return result;
  };

const deleteCommentItemFromDb = async (userId: string, tripId: string) => {
    const deletedItem = await prisma.comment.delete({
      where: { 
        id : tripId,
        userId: userId,
      },
    });
    if(!deletedItem){
      throw new AppError(httpStatus.BAD_REQUEST, 'Comment not deleted');
    }

    return deletedItem;
  };

export const commentService = {
createCommentIntoDb,
getCommentListFromDb,
getCommentByIdFromDb,
updateCommentIntoDb,
deleteCommentItemFromDb,
};