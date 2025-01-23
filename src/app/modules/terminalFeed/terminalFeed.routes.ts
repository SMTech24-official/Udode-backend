import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { terminalFeedController } from './terminalFeed.controller';
import { terminalFeedValidation } from './terminalFeed.validation';
import { multerUpload } from '../../utils/multerUpload';
import { parseBody } from '../../middlewares/parseBody';
import { updateMulterUpload } from '../../utils/updateMulterUpload';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  multerUpload.single('terminalFeedImage'),
  parseBody,
  validateRequest(terminalFeedValidation.createSchema),
  auth(UserRoleEnum.USER),
  terminalFeedController.createTerminalFeed,
);

router.get('/', auth(), terminalFeedController.getTerminalFeedList);

router.get(
  '/:terminalFeedId',
  auth(),
  terminalFeedController.getTerminalFeedById,
);

router.put(
  '/:terminalFeedId',
  updateMulterUpload.single('terminalFeedImage'),
  parseBody,
  auth(),
  validateRequest(terminalFeedValidation.updateSchema),
  terminalFeedController.updateTerminalFeed,
);

router.delete(
  '/:terminalFeedId',
  auth(),
  terminalFeedController.deleteTerminalFeed,
);

export const terminalFeedRoutes = router;