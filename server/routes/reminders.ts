import express from 'express';
import * as reminderController from '../controllers/reminderController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', reminderController.getAllReminders);
router.post('/', reminderController.createReminder);
router.delete('/:id', reminderController.deleteReminder);
router.patch('/:id/complete', reminderController.completeReminder);

export default router;

