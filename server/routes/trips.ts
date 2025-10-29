import express from 'express';
import * as tripController from '../controllers/tripController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.get('/', tripController.getAllTrips);
router.post('/', requireAuth, tripController.createTrip);
router.post('/:id/join', requireAuth, tripController.joinTrip);

export default router;

