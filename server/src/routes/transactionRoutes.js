import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  downloadTransactionsCsv,
  getTransactions,
  uploadTransactionsCsv,
  updateTransaction,
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import {
  handleTransactionCsvUploadError,
  uploadTransactionCsv,
} from '../middleware/uploadTransactionCsv.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.get('/download-csv', downloadTransactionsCsv);
router.post(
  '/upload-csv',
  authorizeRole('admin'),
  uploadTransactionCsv,
  handleTransactionCsvUploadError,
  uploadTransactionsCsv,
);
router.post('/', authorizeRole('admin'), createTransaction);
router.put('/:id', authorizeRole('admin'), updateTransaction);
router.delete('/:id', authorizeRole('admin'), deleteTransaction);

export default router;
