import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { terminalController } from './terminal.controller';
import { terminalValidation } from './terminal.validation';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN),
  validateRequest(terminalValidation.createSchema),
  terminalController.createTerminal,
);

router.get('/', auth(), terminalController.getTerminalList);

router.get('/:id', auth(), terminalController.getTerminalById);

router.put(
  '/:id',
  auth(),
  validateRequest(terminalValidation.updateSchema),
  terminalController.updateTerminal,
);

router.delete('/:id', auth(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN), terminalController.deleteTerminal);

export const terminalRoutes = router;
