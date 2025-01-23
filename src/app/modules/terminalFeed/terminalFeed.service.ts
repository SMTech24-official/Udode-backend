import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const createTerminalFeedIntoDb = async (
  userId: string,
  terminalFeedData: any,
) => {

  const { data, terminalFeedImage } = terminalFeedData;

  const result = await prisma.terminalFeed.create({
    data: {
      ...data,
      image: terminalFeedImage,
      userId: userId,
    },
  });
  if(!result){
    throw new AppError(httpStatus.BAD_REQUEST, 'TerminalFeed not created');
  }
  return result;
};

const getTerminalFeedListFromDb = async () => {
  const result = await prisma.terminalFeed.findMany();
  if(result.length === 0){ 
    return { message: 'TerminalFeed not found' };
  }
  return result;
};

const getTerminalFeedByIdFromDb = async (
  userId: string,
  terminalFeedId: string,
) => {
  const result = await prisma.terminalFeed.findUnique({
    where: {
      id: terminalFeedId,
    },
  });
  if (!result) {
    throw new Error('TerminalFeed not found');
  }
  return result;
};



const updateTerminalFeedIntoDb = async (
  userId: string,
  terminalFeedId: string,
  terminalFeedData: { data: any; terminalFeedImage?: string },
) => {
  const { data, terminalFeedImage } = terminalFeedData;
  const updateData: any = {
    ...data,
    userId: userId,
  };
  if (terminalFeedImage !== undefined) {
    updateData.image = terminalFeedImage;
  }
  const result = await prisma.terminalFeed.update({
    where: { 
      id : terminalFeedId,
    },
    data: updateData,
  });
  return result;
};

const deleteTerminalFeedItemFromDb = async (
  userId: string,
  terminalFeedId: string,
) => {
  const deletedItem = await prisma.terminalFeed.delete({
    where: {
      id: terminalFeedId,
      userId: userId,
    },
  });

  // Add any additional logic if necessary, e.g., cascading deletes
  return deletedItem;
};

export const terminalFeedService = {
  createTerminalFeedIntoDb,
  getTerminalFeedListFromDb,
  getTerminalFeedByIdFromDb,
  updateTerminalFeedIntoDb,
  deleteTerminalFeedItemFromDb,
};