import express from 'express';
import * as messageController from '../controllers/messageController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

router.use(requireAuth);

router.get('/conversations', messageController.getConversations);
router.get('/with/:otherUserId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.get('/search', messageController.searchUsers);

export default router;

