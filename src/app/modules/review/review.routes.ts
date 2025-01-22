import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { reviewController } from './review.controller';
import { reviewValidation } from './review.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(reviewValidation.createSchema),
reviewController.createReview,
);

router.get('/', auth(), reviewController.getReviewList);

router.get('/:reviewId', auth(), reviewController.getReviewById);

router.put(
  '/:reviewId',
  auth(),
  validateRequest(reviewValidation.updateSchema),
  reviewController.updateReview,
);

router.delete('/:reviewId', auth(), reviewController.deleteReview);

export const reviewRoutes = router;