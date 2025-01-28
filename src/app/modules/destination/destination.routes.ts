import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { destinationController } from './destination.controller';
import { destinationValidation } from './destination.validation';
import { multerUpload } from '../../utils/multerUpload';
import { parseBody } from '../../middlewares/parseBody';
import { updateMulterUpload } from '../../utils/updateMulterUpload';

const router = express.Router();

router.post(
  '/',
  multerUpload.single('destinationImage'),
  parseBody,
  validateRequest(destinationValidation.createSchema),
  auth(),
  destinationController.createDestination,
);

router.get('/', auth(), destinationController.getDestinationList);

router.get('/:id', auth(), destinationController.getDestinationById);

router.put(
  '/:destinationId',
  updateMulterUpload.single('destinationImage'),
  parseBody,
  validateRequest(destinationValidation.updateSchema),
  auth(),
  destinationController.updateDestination,
);

router.delete('/:id', auth(), destinationController.deleteDestination);

export const destinationRoutes = router;
