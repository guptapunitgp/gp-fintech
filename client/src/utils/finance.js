import { formatCurrency } from './formatters';

export function calculateSummary(transactions) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
}

export function normalizeTransaction(transaction) {
  return {
    ...transaction,
    id: transaction._id ?? transaction.id,
  };
}

export function calculateMonthlyTrend(transactions) {
  const monthlyMap = transactions.reduce((accumulator, currentTransaction) => {
    const transaction = normalizeTransaction(currentTransaction);
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!accumulator[monthKey]) {
      accumulator[monthKey] = {
        month: date.toLocaleString('en-IN', { month: 'short' }),
        income: 0,
        expenses: 0,
      };
    }

    if (transaction.type === 'income') {
      accumulator[monthKey].income += transaction.amount;
    } else {
      accumulator[monthKey].expenses += transaction.amount;
    }

    return accumulator;
  }, {});

  return Object.entries(monthlyMap)
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([, value]) => ({
      month: value.month,
      balance: value.income - value.expenses,
    }));
}

export function calculateCategoryBreakdown(transactions) {
  const expenseMap = transactions
    .map(normalizeTransaction)
    .filter((transaction) => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      accumulator[transaction.category] =
        (accumulator[transaction.category] ?? 0) + transaction.amount;
      return accumulator;
    }, {});

  return Object.entries(expenseMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getVisibleTransactions(transactions, filters) {
  return [...transactions]
    .map(normalizeTransaction)
    .filter((transaction) => {
      const searchValue = filters.search.trim().toLowerCase();
      const matchesSearch =
        searchValue === '' ||
        transaction.category.toLowerCase().includes(searchValue) ||
        String(transaction.amount).includes(searchValue);
      const matchesType =
        filters.type === 'all' || transaction.type === filters.type;
      return matchesSearch && matchesType;
    })
    .sort((transactionA, transactionB) => {
      if (filters.sortBy === 'amount') {
        return transactionB.amount - transactionA.amount;
      }

      return new Date(transactionB.date) - new Date(transactionA.date);
    });
}

export function calculateExpenseRatio(transactions, monthlyIncome) {
  const summary = calculateSummary(transactions);
  if (!monthlyIncome) return 0;
  return Math.max(0, (summary.expenses / monthlyIncome) * 100);
}

export function calculateSavingsRate(transactions, monthlyIncome) {
  const summary = calculateSummary(transactions);
  if (!monthlyIncome) return 0;
  return ((monthlyIncome - summary.expenses) / monthlyIncome) * 100;
}

export function calculatePortfolioSummary(portfolio = []) {
  return portfolio.reduce(
    (accumulator, holding) => {
      accumulator.totalInvested += holding.buyPrice * holding.quantity;
      accumulator.currentValue += holding.currentPrice * holding.quantity;
      accumulator.profit += holding.profit;
      return accumulator;
    },
    { totalInvested: 0, currentValue: 0, profit: 0 },
  );
}

export function getInsights(transactions, profile = {}, portfolio = []) {
  const expenseBreakdown = calculateCategoryBreakdown(transactions);
  const monthlyTrend = calculateMonthlyTrend(transactions);

  const highest = expenseBreakdown[0];
  const currentMonth = monthlyTrend[monthlyTrend.length - 1];
  const previousMonth = monthlyTrend[monthlyTrend.length - 2];

  let monthlyComparisonTitle = 'Stable month-over-month performance';
  let monthlyComparisonText =
    'More monthly data will sharpen the comparison between your recent periods.';

  if (currentMonth && previousMonth) {
    const difference = currentMonth.balance - previousMonth.balance;
    monthlyComparisonTitle =
      difference >= 0 ? 'Balance improved this month' : 'Balance softened this month';
    monthlyComparisonText = `Compared with last month, your balance changed by ${formatCurrency(
      Math.abs(difference),
    )}.`;
  }

  const summary = calculateSummary(transactions);
  const savingsRate = calculateSavingsRate(transactions, profile.monthlyIncome || summary.income);
  const expenseRatio = calculateExpenseRatio(transactions, profile.monthlyIncome || summary.income);
  const portfolioSummary = calculatePortfolioSummary(portfolio);
  const portfolioDirection = portfolioSummary.profit >= 0 ? 'profit' : 'loss';

  return {
    highestCategory: highest?.name ?? 'No expense data',
    highestCategoryText: highest
      ? `${highest.name} accounts for the largest share of expenses at ${formatCurrency(
          highest.value,
        )}.`
      : 'Start logging expense categories to uncover your biggest spending area.',
    monthlyComparisonTitle,
    monthlyComparisonText,
    savingsTitle: `You are saving ${Math.round(savingsRate)}% of your income`,
    savingsText:
      profile.monthlyIncome > 0
        ? `Your current expense ratio is ${Math.round(expenseRatio)}% against a monthly income of ${formatCurrency(profile.monthlyIncome)}.`
        : 'Add your monthly income in Profile to unlock savings-rate based insights.',
    portfolioTitle: `Your stock portfolio is in ${portfolioDirection}`,
    portfolioText:
      portfolio.length > 0
        ? `Across your tracked holdings, the portfolio is ${portfolioDirection} by ${formatCurrency(
            Math.abs(portfolioSummary.profit),
          )}.`
        : 'Add stock purchases to track live portfolio profit and loss.',
    general:
      summary.balance >= 0
        ? `Income is currently covering expenses comfortably, and your cash flow remains stable.`
        : 'Expenses are exceeding income right now. Consider reviewing large recurring categories first.',
  };
}
