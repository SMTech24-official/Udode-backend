import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


const createTerminalIntoDb = async (userId: string, data: {
    terminalName: string;
    fareRange: string;
    vendorName: string;
    location: string;
    latitude: number;
    longitude: number;
    openingHours: string;
    transportationType: string;
}) => {

    const result = await prisma.terminal.create({ 
      data: {
        ...data,
        userId: userId,
      },
     });
     if(!result){
        throw new AppError(httpStatus.BAD_REQUEST, 'Terminal not created');
      }
     
    return result;
  };

const getTerminalListFromDb = async () => {
  const result = await prisma.terminal.findMany();
  if(result.length === 0){ 
    return { message: 'Terminal not found' };
  }
  return result;
};


const getTerminalByIdFromDb = async (id: string) => {
  const result = await prisma.terminal.findUnique({ where: { id } });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST,'Terminal not found');
  }
  return result;
};


const updateTerminalIntoDb = async (id: string, data: any) => {
    const result = await prisma.terminal.update({
      where: { id },
      data,
    });
    if(!result){
      throw new AppError(httpStatus.NOT_MODIFIED, 'Terminal not updated');
    }
    return result;
  
};


const deleteTerminalItemFromDb = async (userId: string, terminalId: string) => {
  const transaction = await prisma.$transaction(async prisma => {
    const deletedItem = await prisma.terminal.delete({
      where: { 
        id: terminalId,
        userId: userId,},
    });
    if(!deletedItem){
      throw new AppError(httpStatus.BAD_REQUEST, 'Terminal not deleted');
    }

    return deletedItem;
  });

  return transaction;
};
;

export const terminalService = {
  createTerminalIntoDb,
  getTerminalListFromDb,
  getTerminalByIdFromDb,
  updateTerminalIntoDb,
  deleteTerminalItemFromDb,
};