import express from 'express';
import * as voiceController from '../controllers/voiceController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.post('/command', voiceController.upload.single('file'), voiceController.processVoiceCommand);

export default router;
