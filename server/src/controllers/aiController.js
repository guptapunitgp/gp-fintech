import { createAiTextResponse, isOpenAiConfigured } from '../utils/openai.js';

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
    return response.status(500).json({
      message: error.message || 'Unable to generate AI stock analysis right now.',
    });
  }
}
