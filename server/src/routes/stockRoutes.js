import { Router } from 'express';
import { buyStock, getPortfolio, getStocks, searchStocks } from '../controllers/stockController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', getStocks);
router.get('/search', searchStocks);
router.post('/buy', buyStock);
router.get('/portfolio', getPortfolio);

export default router;
