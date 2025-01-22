import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';



const createCategoryIntoDb = async (userId: string, data: any) => {

    const result = await prisma.category.create({ 
      data: {
        ...data,
        userId: userId,
      }
     });

     if(!result){
        throw new AppError(httpStatus.BAD_REQUEST, 'Category not created');
      }
    return result;
  }


const getCategoryListFromDb = async () => {
  const result = await prisma.category.findMany();
  if (result.length === 0) {
    return { message: 'Category not found' };
  }
  return result;
};


const getCategoryByIdFromDb = async (userId: string, categoryId: string) => {

  const result = await prisma.category.findUnique({ 
    where: { 
      id : categoryId,
    } 
  });
  if (!result) {
    throw new Error('Category not found');
  }
  return result;
};


const updateCategoryIntoDb = async (
  userId: string,
  categoryId: string,
  data: any,
) => {
  const result = await prisma.category.update({
    where: {
      id: categoryId,
      userId: userId,
    },
    data: {
      categoryName: data.categoryName,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category not updated');
  }
  return result;
};


const deleteCategoryItemFromDb = async (userId: string, categoryId: string) => {
  const deletedItem = await prisma.category.delete({
    where: {
      id: categoryId,
      userId: userId,
    },
  });
  if(!deletedItem){
    throw new AppError(httpStatus.BAD_REQUEST, 'Category not deleted');
  }

  return deletedItem;
};


export const categoryService = {
  createCategoryIntoDb,
  getCategoryListFromDb,
  getCategoryByIdFromDb,
  updateCategoryIntoDb,
  deleteCategoryItemFromDb,
};