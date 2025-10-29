import express from 'express';
import * as eventController from '../controllers/eventController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.post('/', requireAuth, eventController.createEvent);
router.post('/:id/register', requireAuth, eventController.registerForEvent);

export default router;

