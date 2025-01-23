import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { reviewController } from './review.controller';
import { reviewValidation } from './review.validation';

const router = express.Router();

router.post(
'/',
validateRequest(reviewValidation.createSchema),
auth(),
reviewController.createReview,
);

router.get('/:terminalId', auth(), reviewController.getReviewList);

router.get('/single/:reviewId', auth(), reviewController.getReviewById);

router.put(
  '/:reviewId',
  validateRequest(reviewValidation.updateSchema),
  auth(),
  reviewController.updateReview,
);

router.delete('/:reviewId', auth(), reviewController.deleteReview);

export const reviewRoutes = router;