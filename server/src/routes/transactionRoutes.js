import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', authorizeRole('admin'), createTransaction);
router.put('/:id', authorizeRole('admin'), updateTransaction);
router.delete('/:id', authorizeRole('admin'), deleteTransaction);

export default router;
