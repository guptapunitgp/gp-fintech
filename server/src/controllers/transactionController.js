import Transaction from '../models/Transaction.js';
import {
  buildTransactionsCsv,
  parseTransactionsCsvFile,
  removeUploadedFile,
} from '../utils/transactionCsv.js';

function buildTransactionPayload(body) {
  const title = String(body.title || body.category || '').trim();
  const category = String(body.category || '').trim();
  const type = String(body.type || '').trim().toLowerCase();
  const amount = Number(body.amount);
  const date = body.date ? new Date(body.date) : null;

  return {
    title,
    category,
    type,
    amount,
    date,
  };
}

function validateTransactionPayload(payload) {
  if (!payload.title || !payload.category || !payload.type || !payload.date || !Number.isFinite(payload.amount)) {
    return 'All transaction fields are required.';
  }

  if (!['income', 'expense'].includes(payload.type)) {
    return 'Transaction type must be income or expense.';
  }

  if (payload.amount <= 0) {
    return 'Transaction amount must be greater than zero.';
  }

  if (Number.isNaN(payload.date.getTime())) {
    return 'Transaction date must be valid.';
  }

  return '';
}

export async function getTransactions(request, response) {
  try {
    const transactions = await Transaction.find({ userId: request.user._id }).sort({ date: -1 });
    return response.status(200).json(transactions);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to load transactions.' });
  }
}

export async function createTransaction(request, response) {
  try {
    const payload = buildTransactionPayload(request.body);
    const validationMessage = validateTransactionPayload(payload);

    if (validationMessage) {
      return response.status(400).json({ message: validationMessage });
    }

    const transaction = await Transaction.create({
      title: payload.title,
      userId: request.user._id,
      date: payload.date,
      amount: payload.amount,
      category: payload.category,
      type: payload.type,
    });

    return response.status(201).json(transaction);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to create the transaction.' });
  }
}

export async function updateTransaction(request, response) {
  try {
    const { id } = request.params;
    const payload = buildTransactionPayload(request.body);
    const validationMessage = validateTransactionPayload(payload);

    if (validationMessage) {
      return response.status(400).json({ message: validationMessage });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: request.user._id },
      {
        title: payload.title,
        date: payload.date,
        amount: payload.amount,
        category: payload.category,
        type: payload.type,
      },
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return response.status(404).json({ message: 'Transaction not found.' });
    }

    return response.status(200).json(transaction);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to update the transaction.' });
  }
}

export async function deleteTransaction(request, response) {
  try {
    const { id } = request.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: request.user._id });

    if (!transaction) {
      return response.status(404).json({ message: 'Transaction not found.' });
    }

    return response.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    return response.status(500).json({ message: 'Unable to delete the transaction.' });
  }
}

export async function uploadTransactionsCsv(request, response) {
  if (!request.file) {
    return response.status(400).json({ message: 'Please upload a CSV file in the "file" field.' });
  }

  try {
    // Sample CSV:
    // title,amount,type,category,date
    // Salary,85000,income,Salary,2026-04-01
    // Groceries,3200,expense,Food,2026-04-02
    const { hasRows, validTransactions, errors } = await parseTransactionsCsvFile(request.file.path);

    if (!hasRows) {
      return response.status(400).json({
        success: false,
        insertedCount: 0,
        failedCount: 0,
        errors: ['CSV file is empty. Add a header row and at least one transaction row.'],
      });
    }

    if (!validTransactions.length) {
      return response.status(400).json({
        success: false,
        insertedCount: 0,
        failedCount: errors.length,
        errors,
      });
    }

    const transactionsToInsert = validTransactions.map((transaction) => ({
      ...transaction,
      userId: request.user._id,
    }));

    await Transaction.insertMany(transactionsToInsert, {
      ordered: false,
    });

    return response.status(200).json({
      success: true,
      insertedCount: validTransactions.length,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      insertedCount: 0,
      failedCount: 0,
      errors: [error.message || 'Unable to import the CSV file.'],
    });
  } finally {
    await removeUploadedFile(request.file?.path).catch(() => null);
  }
}

export async function downloadTransactionsCsv(request, response) {
  try {
    const transactions = await Transaction.find({ userId: request.user._id })
      .sort({ date: -1 })
      .lean();

    const csvContent = buildTransactionsCsv(transactions);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');

    return response.status(200).send(csvContent);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to download transactions as CSV.' });
  }
}
