import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { terminalController } from './terminal.controller';
import { terminalValidation } from './terminal.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
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

router.delete('/:id', auth(), terminalController.deleteTerminal);

export const terminalRoutes = router;
