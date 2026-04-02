import Transaction from '../models/Transaction.js';

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
    const { date, amount, category, type } = request.body;

    if (!date || !amount || !category || !type) {
      return response.status(400).json({ message: 'All transaction fields are required.' });
    }

    const transaction = await Transaction.create({
      userId: request.user._id,
      date,
      amount,
      category,
      type,
    });

    return response.status(201).json(transaction);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to create the transaction.' });
  }
}

export async function updateTransaction(request, response) {
  try {
    const { id } = request.params;
    const { date, amount, category, type } = request.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: request.user._id },
      { date, amount, category, type },
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
