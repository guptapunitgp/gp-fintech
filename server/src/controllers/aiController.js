import {
  createAiTextResponse,
  isOpenAiConfigured,
  OpenAiQuotaError,
} from '../utils/openai.js';

function buildFinanceFallback({ profile, transactions, portfolio, question }) {
  const monthlyIncome = Number(profile?.monthlyIncome || 0);
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const effectiveIncome = monthlyIncome || totalIncome;
  const savingsRate = effectiveIncome > 0
    ? Math.round(((effectiveIncome - totalExpenses) / effectiveIncome) * 100)
    : 0;
  const topExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((accumulator, transaction) => {
      const next = { ...accumulator };
      next[transaction.category] = (next[transaction.category] || 0) + Number(transaction.amount || 0);
      return next;
    }, {});
  const topExpenseEntry = Object.entries(topExpense).sort((left, right) => right[1] - left[1])[0];
  const portfolioProfit = portfolio.reduce((sum, item) => sum + Number(item.profit || 0), 0);

  return [
    `Live OpenAI help is temporarily unavailable because the API quota has been exhausted.`,
    '',
    `Quick dashboard-based guidance for your question: "${String(question || '').trim()}"`,
    `- Total expenses tracked: ${totalExpenses.toFixed(0)}`,
    `- Estimated savings rate: ${savingsRate}%`,
    `- Highest expense category: ${topExpenseEntry ? `${topExpenseEntry[0]} (${topExpenseEntry[1].toFixed(0)})` : 'No expense data yet'}`,
    `- Portfolio status: ${portfolioProfit >= 0 ? 'in profit' : 'in loss'} by ${Math.abs(portfolioProfit).toFixed(0)}`,
    '',
    `Suggested next step: review the largest expense category first, set one spending cap for the next 7 days, and compare your cash outflow against monthly income before adding new investments.`,
    '',
    `Educational note: this fallback is rule-based and not financial advice.`,
  ].join('\n');
}

function buildStockFallback(stock) {
  const currentPrice = Number(stock?.currentPrice || 0);
  const movingAverage = Number(stock?.movingAverage || 0);
  const trend = stock?.trend || 'Stable';
  const volatility = stock?.volatility || 'Low';
  const changePercent = Number(stock?.changePercent || 0);
  const aboveAverage = currentPrice >= movingAverage;

  return [
    `Live OpenAI stock analysis is temporarily unavailable because the API quota has been exhausted.`,
    '',
    `Rule-based summary for ${stock?.symbol || 'this stock'}:`,
    `- Current trend: ${trend}`,
    `- Volatility: ${volatility}`,
    `- Daily change: ${changePercent.toFixed(2)}%`,
    `- Price vs moving average: ${aboveAverage ? 'above' : 'below'} the recent average`,
    '',
    `What to watch next:`,
    `- If price stays above the moving average with controlled volatility, momentum is healthier.`,
    `- If volatility rises while price slips below the moving average, risk is increasing.`,
    '',
    `Educational note: this fallback is for study only and not investment advice.`,
  ].join('\n');
}

function buildFinanceSnapshot(profile, transactions, portfolio) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const balance = income - expenses;
  const portfolioProfit = portfolio.reduce((sum, item) => sum + Number(item.profit || 0), 0);

  return {
    profile: {
      name: profile?.name || '',
      monthlyIncome: Number(profile?.monthlyIncome || 0),
      savingGoal: Number(profile?.savingGoal || 0),
      role: profile?.role || 'viewer',
    },
    totals: {
      income,
      expenses,
      balance,
      portfolioProfit,
    },
    recentTransactions: transactions.slice(0, 10).map((transaction) => ({
      date: transaction.date,
      amount: Number(transaction.amount || 0),
      category: transaction.category,
      type: transaction.type,
    })),
    holdings: portfolio.slice(0, 8).map((item) => ({
      stockName: item.stockName,
      quantity: Number(item.quantity || 0),
      buyPrice: Number(item.buyPrice || 0),
      currentPrice: Number(item.currentPrice || 0),
      profit: Number(item.profit || 0),
      mode: item.mode || 'investment',
    })),
  };
}

function buildStockSnapshot(stock) {
  return {
    symbol: stock?.symbol || '',
    name: stock?.name || '',
    sector: stock?.sector || '',
    currentPrice: Number(stock?.currentPrice || 0),
    changePercent: Number(stock?.changePercent || 0),
    trend: stock?.trend || 'Stable',
    movingAverage: Number(stock?.movingAverage || 0),
    volatility: stock?.volatility || 'Low',
    prediction: stock?.prediction || null,
    history: Array.isArray(stock?.history)
      ? stock.history.slice(-10).map((entry) => ({
          label: entry.label,
          price: Number(entry.price || 0),
        }))
      : [],
    candleHistory: Array.isArray(stock?.candleHistory)
      ? stock.candleHistory.slice(-8).map((entry) => ({
          label: entry.label,
          open: Number(entry.open || 0),
          high: Number(entry.high || 0),
          low: Number(entry.low || 0),
          close: Number(entry.close || 0),
          direction: entry.direction,
        }))
      : [],
  };
}

export async function getFinanceAssistantResponse(request, response) {
  try {
    if (!isOpenAiConfigured()) {
      return response.status(503).json({
        message: 'OpenAI is not configured. Add OPENAI_API_KEY in server/.env to enable AI help.',
      });
    }

    const { question, profile, transactions = [], portfolio = [] } = request.body;

    if (!String(question || '').trim()) {
      return response.status(400).json({ message: 'A finance question is required.' });
    }

    const financeSnapshot = buildFinanceSnapshot(profile, transactions, portfolio);
    const aiResponse = await createAiTextResponse({
      systemPrompt:
        'You are a concise fintech dashboard assistant. Give practical, educational personal finance suggestions. Use short paragraphs or short bullet lists. Never claim guaranteed returns. Mention that stock-related comments are educational, not financial advice.',
      userPrompt: `User question: ${String(question).trim()}\n\nFinance dashboard data:\n${JSON.stringify(financeSnapshot, null, 2)}`,
    });

    return response.status(200).json({
      answer: aiResponse.text,
      model: aiResponse.model,
    });
  } catch (error) {
    if (error instanceof OpenAiQuotaError) {
      return response.status(200).json({
        answer: buildFinanceFallback(request.body),
        model: 'local-fallback',
        degraded: true,
        message: error.message,
      });
    }

    return response.status(500).json({
      message: error.message || 'Unable to generate AI help right now.',
    });
  }
}

export async function getStockAssistantResponse(request, response) {
  try {
    if (!isOpenAiConfigured()) {
      return response.status(503).json({
        message: 'OpenAI is not configured. Add OPENAI_API_KEY in server/.env to enable AI stock analysis.',
      });
    }

    const { stock } = request.body;

    if (!stock?.symbol || !stock?.name) {
      return response.status(400).json({ message: 'Stock details are required.' });
    }

    const stockSnapshot = buildStockSnapshot(stock);
    const aiResponse = await createAiTextResponse({
      systemPrompt:
        'You are an educational stock study assistant inside a finance dashboard. Explain momentum, trend, volatility, and chart behavior in plain English. Keep the tone calm and factual. Do not give guaranteed-return language. End with a brief educational disclaimer.',
      userPrompt: `Analyze this Indian stock snapshot for a learner.\n\n${JSON.stringify(stockSnapshot, null, 2)}\n\nReturn:\n1. A short summary\n2. Key bullish signals\n3. Key risk signals\n4. What to watch next on the chart`,
    });

    return response.status(200).json({
      answer: aiResponse.text,
      model: aiResponse.model,
      symbol: stockSnapshot.symbol,
    });
  } catch (error) {
    if (error instanceof OpenAiQuotaError) {
      return response.status(200).json({
        answer: buildStockFallback(request.body.stock),
        model: 'local-fallback',
        symbol: request.body.stock?.symbol || '',
        degraded: true,
        message: error.message,
      });
    }

    return response.status(500).json({
      message: error.message || 'Unable to generate AI stock analysis right now.',
    });
  }
}
