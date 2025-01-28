import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { tripController } from './trip.controller';
import { tripValidation } from './trip.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(tripValidation.createSchema),
tripController.createTrip,
);

router.get('/', auth(), tripController.getTripList);

router.get('/user-trips', auth(), tripController.getTripListByUser);

router.get('/:tripId', auth(), tripController.getTripById);


router.put(
  '/:tripId',
  validateRequest(tripValidation.updateSchema),
  auth(),
  tripController.updateTrip,
);

router.delete('/:tripId', auth(), tripController.deleteTrip);

export const tripRoutes = router;