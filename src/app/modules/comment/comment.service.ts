import prisma from '../../utils/prisma';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';


type CommentWithReplies = {
  id: string;
  userId: string;
  tripId: string;
  parentId: string | null;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string;
    image: string | null;
    role: string;
  };
  replies: CommentWithReplies[]; // This will hold nested replies
};




const createCommentIntoDb = async (userId: string, data: any) => {
  const result = await prisma.comment.create({
    data: {
      ...data,
      userId: userId,
      parentId: data.parentId || null, // Ensure parentId is null if not provided
    },
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment not created');
  }

  return result;
};

const getNestedReplies = async (
  parentId: string,
): Promise<CommentWithReplies[]> => {
  // Recursively fetch replies for a given parentId
  const replies = await prisma.comment.findMany({
    where: {
      parentId: parentId, // Fetch replies for the current comment
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          image: true,
          role: true,
        },
      },
      replies: false, // We will handle the recursive replies in the parent function
    },
  });

  // For each reply, fetch its nested replies
  for (const reply of replies) {
    (reply as CommentWithReplies).replies = await getNestedReplies(reply.id); // Recursively fetch replies for this reply
  }

  return replies.map(reply => ({
    ...reply,
    replies: (reply as CommentWithReplies).replies || [],
  }));
};


const getCommentListFromDb = async (
  tripId: string,
): Promise<CommentWithReplies[]> => {
  // Fetch all comments for the given tripId, including top-level comments and replies
  const comments = await prisma.comment.findMany({
    where: {
      tripId: tripId, // Fetch all comments for the given tripId
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          image: true,
          role: true,
        },
      },
      replies: false, // We will manually fetch the replies for each comment
    },
  });

  if (comments.length === 0) {
    return [];
  }

  // Organize comments into a hierarchical structure
  const topLevelComments = comments.filter(
    comment => comment.parentId === null,
  );

  // For each top-level comment, fetch its nested replies
  for (const comment of topLevelComments) {
    (comment as CommentWithReplies).replies = await getNestedReplies(comment.id);
  }

  return topLevelComments.map(comment => ({
    ...comment,
    replies: (comment as CommentWithReplies).replies || [],
  }));
};






const getCommentByIdFromDb = async (tripId: string) => {
  const result = await prisma.comment.findUnique({
    where: {
      id: tripId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return result;
};

const replyCommentByTripIdFromDb = async (userId: string, data: any) => {
  const result = await prisma.comment.findUnique({
    where: {
      id: data.commentId,
      tripId: data.tripId,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const reply = await prisma.comment.create({
    data: {
      tripId: data.tripId,
      parentId: data.parentId,
      userId: userId,
      comment: data.comment,
    },
  });

  if (!reply) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment not created');
  }
  return reply;
};

const updateCommentIntoDb = async (
  userId: string,
  tripId: string,
  data: any,
) => {
  const result = await prisma.comment.update({
    where: {
      id: tripId,
      userId: userId,
    },
    data,
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_MODIFIED, 'Comment not updated');
  }
  return result;
};

const deleteCommentItemFromDb = async (userId: string, commentId: string) => {
  // Fetch all replies for the comment
  const replies = await prisma.comment.findMany({
    where: {
      parentId: commentId,
    },
  });

  // Collect all comment IDs to delete
  let commentIdsToDelete = [commentId, ...replies.map(reply => reply.id)];

  // Perform batch deletion
  const deletedItems = await prisma.comment.deleteMany({
    where: {
      id: { in: commentIdsToDelete },
      userId: userId, // Ensure the user is authorized to delete the comment
    },
  });

  if (deletedItems.count === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Comment not deleted');
  }

  return deletedItems;
};


export const commentService = {
  createCommentIntoDb,
  getCommentListFromDb,
  getCommentByIdFromDb,
  updateCommentIntoDb,
  deleteCommentItemFromDb,
  replyCommentByTripIdFromDb,
};
