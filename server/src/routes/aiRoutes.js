import { Router } from 'express';
import {
  getFinanceAssistantResponse,
  getStockAssistantResponse,
} from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.post('/finance-help', getFinanceAssistantResponse);
router.post('/stock-analysis', getStockAssistantResponse);

export default router;
