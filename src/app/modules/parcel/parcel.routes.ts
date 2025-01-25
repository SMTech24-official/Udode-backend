import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { parcelController } from './parcel.controller';
import { parcelValidation } from './parcel.validation';
import { multerUpload } from '../../utils/multerUpload';
import { parseBody } from '../../middlewares/parseBody';
import { UserRoleEnum } from '@prisma/client';
import { updateMulterUpload } from '../../utils/updateMulterUpload';

const router = express.Router();

router.post(
  '/',
  multerUpload.single('parcelImage'),
  parseBody,
  validateRequest(parcelValidation.createSchema),
  auth(),
  parcelController.createParcel,
);

router.get('/', auth(), parcelController.getParcelList);

router.get(
    '/user-parcels',
    auth(UserRoleEnum.USER),
    parcelController.getParcelListByUser,
)

router.get(
  '/pickup-parcels',
  auth(UserRoleEnum.USER),
  parcelController.getParcelListToPickup,
);

router.get('/:parcelId', auth(), parcelController.getParcelById);


router.put(
  '/:parcelId',
  updateMulterUpload.single('parcelImage'),
  parseBody,
  auth(),
  validateRequest(parcelValidation.updateSchema),
  parcelController.updateParcel,
);
router.put(
  '/accept-parcel/:parcelId',
  auth(),
  validateRequest(parcelValidation.parcelStatus),
  parcelController.updateParcelToAccept,
);

router.put(
  '/pickup-parcel/:parcelId',
  auth(),
  validateRequest(parcelValidation.parcelStatus),
  parcelController.updateParcelToPickup,
);

router.delete('/:parcelId', auth(), parcelController.deleteParcel);


export const ParcelRoutes = router;