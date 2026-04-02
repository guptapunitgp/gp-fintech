import { Router } from 'express';
import {
  cancelDeleteAccount,
  getProfile,
  requestDeleteAccount,
  updateProfile,
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/deletion-request', requestDeleteAccount);
router.delete('/profile/deletion-request', cancelDeleteAccount);

export default router;
