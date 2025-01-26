import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { commentController } from './comment.controller';
import { commentValidation } from './comment.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(commentValidation.createSchema),
  auth(),
  commentController.createComment,
);


router.post(
  '/reply',
  validateRequest(commentValidation.updateSchema),
  auth(),
  commentController.replyCommentByTripId,
);

router.get('/all-comments/:tripId', auth(), commentController.getAllCommentByTripId);

router.get('/:tripId', auth(), commentController.getCommentList);


router.put(
  '/:commentId',
  validateRequest(commentValidation.updateSchema),
  auth(),
  commentController.updateComment,
);

router.delete('/:commentId', auth(), commentController.deleteComment);

export const commentRoutes = router;
