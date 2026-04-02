import { featuredSymbols, indianStocks, stockAliases } from '../data/indianStocks.js';
import Portfolio from '../models/Portfolio.js';

const stockUniverse = indianStocks.reduce((accumulator, stock) => {
  accumulator[stock.symbol] = stock;
  return accumulator;
}, {});

function normalizeSearchValue(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function getCanonicalSymbol(value) {
  const normalized = normalizeSearchValue(value);
  return stockAliases[normalized] || normalized;
}

function buildSeries({ basePrice, length, labelFormatter, amplitude, drift, phase }) {
  return Array.from({ length }, (_, index) => {
    const waveOne = Math.sin((index + 1) * phase.primary) * amplitude.primary;
    const waveTwo = Math.cos((index + 1) * phase.secondary) * amplitude.secondary;
    const trend = (index - length / 2) * drift;
    const price = Math.max(basePrice * 0.55, basePrice + waveOne + waveTwo + trend);

    return {
      label: labelFormatter(index),
      price: Number(price.toFixed(2)),
    };
  });
}

function buildTimeframes(basePrice, seed) {
  return {
    '1W': buildSeries({
      basePrice,
      length: 7,
      labelFormatter: (index) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      amplitude: { primary: 18, secondary: 9 },
      drift: 1.4,
      phase: { primary: 0.95 + seed * 0.01, secondary: 0.52 + seed * 0.005 },
    }),
    '1M': buildSeries({
      basePrice,
      length: 22,
      labelFormatter: (index) => `D${index + 1}`,
      amplitude: { primary: 24, secondary: 12 },
      drift: 0.9,
      phase: { primary: 0.58 + seed * 0.008, secondary: 0.31 + seed * 0.006 },
    }),
    '1Y': buildSeries({
      basePrice,
      length: 12,
      labelFormatter: (index) =>
        ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][index],
      amplitude: { primary: 64, secondary: 28 },
      drift: 4.5,
      phase: { primary: 0.46 + seed * 0.007, secondary: 0.22 + seed * 0.004 },
    }),
    '5Y': buildSeries({
      basePrice,
      length: 20,
      labelFormatter: (index) => `Y${Math.floor(index / 4) + 1} Q${(index % 4) + 1}`,
      amplitude: { primary: 180, secondary: 92 },
      drift: 14,
      phase: { primary: 0.29 + seed * 0.005, secondary: 0.14 + seed * 0.003 },
    }),
  };
}

function buildHistory(basePrice, seed) {
  return buildSeries({
    basePrice,
    length: 14,
    labelFormatter: (index) => `D${index + 1}`,
    amplitude: { primary: 22, secondary: 11 },
    drift: 0.85,
    phase: { primary: 0.9 + seed * 0.01, secondary: 0.4 + seed * 0.006 },
  }).map((entry, index) => {
    const drift = Math.sin(index * 0.9) * 22 + Math.cos(index * 0.4) * 11;
    return {
      label: entry.label,
      price: Number((entry.price + drift * 0.08).toFixed(2)),
    };
  });
}

function buildCandleHistory(history) {
  return history.map((entry, index) => {
    const previousClose = history[index - 1]?.price ?? entry.price - 8;
    const open = Number(previousClose.toFixed(2));
    const close = Number(entry.price.toFixed(2));
    const upperWick = 6 + ((index % 4) + 1) * 1.8;
    const lowerWick = 5 + (((index + 2) % 4) + 1) * 1.6;
    const high = Number((Math.max(open, close) + upperWick).toFixed(2));
    const low = Number((Math.min(open, close) - lowerWick).toFixed(2));

    return {
      label: entry.label,
      open,
      high,
      low,
      close,
      bodyTop: Math.max(open, close),
      bodyBottom: Math.min(open, close),
      bodySize: Number(Math.abs(close - open).toFixed(2)),
      direction: close >= open ? 'bullish' : 'bearish',
    };
  });
}

function calculateMovingAverage(history, windowSize = 7) {
  const slice = history.slice(-windowSize);
  if (!slice.length) return 0;
  const total = slice.reduce((sum, entry) => sum + entry.price, 0);
  return Number((total / slice.length).toFixed(2));
}

function calculateVolatility(history) {
  if (history.length < 2) return 'Low';
  const changes = history.slice(1).map((entry, index) => Math.abs(entry.price - history[index].price));
  const averageMove = changes.reduce((sum, value) => sum + value, 0) / changes.length;
  if (averageMove > 20) return 'High';
  if (averageMove > 10) return 'Medium';
  return 'Low';
}

function calculateTrend(history) {
  if (history.length < 2) return 'Stable';
  const first = history[0].price;
  const last = history[history.length - 1].price;
  const delta = last - first;
  if (delta > 8) return 'Increasing';
  if (delta < -8) return 'Decreasing';
  return 'Stable';
}

function calculatePrediction(history) {
  const recent = history.slice(-5);
  if (recent.length < 2) {
    return { label: 'Insufficient data', confidence: 50 };
  }

  const risingDays = recent.slice(1).filter((entry, index) => entry.price > recent[index].price).length;
  const fallingDays = recent.length - 1 - risingDays;

  if (risingDays > fallingDays) {
    return { label: 'Likely to Rise', confidence: 68 + risingDays * 4 };
  }

  if (fallingDays > risingDays) {
    return { label: 'Likely to Fall', confidence: 68 + fallingDays * 4 };
  }

  return { label: 'Likely to Stay Stable', confidence: 58 };
}

function buildStockPayload(stock, index) {
  const currentPrice = Number((stock.basePrice + Math.sin(index + 1) * 34).toFixed(2));
  const changePercent = Number(
    ((((currentPrice - stock.basePrice) / stock.basePrice) * 100).toFixed(2)),
  );
  const history = buildHistory(stock.basePrice, index + 1);
  const timeframes = buildTimeframes(stock.basePrice, index + 1);
  const trend = calculateTrend(history);
  const movingAverage = calculateMovingAverage(history, 7);
  const volatility = calculateVolatility(history);
  const prediction = calculatePrediction(history);
  const candleHistory = buildCandleHistory(history);

  return {
    symbol: stock.symbol,
    name: stock.name,
    sector: stock.sector,
    currentPrice,
    changePercent,
    trend,
    movingAverage,
    volatility,
    prediction,
    history,
    candleHistory,
    timeframes,
  };
}

function buildLiveStocks() {
  return Object.values(stockUniverse).map((stock, index) => buildStockPayload(stock, index));
}

function rankSearchResults(stocks, query) {
  const normalizedQuery = normalizeSearchValue(query);

  return stocks
    .map((stock) => {
      const normalizedSymbol = normalizeSearchValue(stock.symbol);
      const normalizedName = normalizeSearchValue(stock.name);
      const aliasMatch = Object.entries(stockAliases).some(
        ([alias, symbol]) => symbol === stock.symbol && alias.includes(normalizedQuery),
      );

      let score = 0;

      if (normalizedSymbol === normalizedQuery) score += 120;
      if (normalizedName === normalizedQuery) score += 100;
      if (normalizedSymbol.startsWith(normalizedQuery)) score += 80;
      if (normalizedName.startsWith(normalizedQuery)) score += 70;
      if (normalizedSymbol.includes(normalizedQuery)) score += 50;
      if (normalizedName.includes(normalizedQuery)) score += 40;
      if (aliasMatch) score += 30;

      return { stock, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.stock.name.localeCompare(right.stock.name))
    .map((entry) => entry.stock);
}

function evaluatePrediction(predictedDirection, buyPrice, currentPrice) {
  if (!predictedDirection) {
    return null;
  }

  const changePercent = ((currentPrice - buyPrice) / buyPrice) * 100;
  const threshold = 1.2;

  if (predictedDirection === 'rise') {
    if (changePercent >= threshold) return 'correct';
    if (changePercent <= -threshold) return 'wrong';
    return 'pending';
  }

  if (predictedDirection === 'fall') {
    if (changePercent <= -threshold) return 'correct';
    if (changePercent >= threshold) return 'wrong';
    return 'pending';
  }

  if (Math.abs(changePercent) <= threshold) {
    return 'correct';
  }

  return 'wrong';
}

export async function searchStocks(request, response) {
  try {
    const query = String(request.query.q || '').trim();
    const stocks = buildLiveStocks();

    if (!query) {
      return response.status(200).json(
        stocks.filter((stock) => featuredSymbols.includes(stock.symbol)).slice(0, 8),
      );
    }

    const canonicalSymbol = getCanonicalSymbol(query);
    const exactStock = stocks.find((stock) => stock.symbol === canonicalSymbol);
    const rankedMatches = rankSearchResults(stocks, query);
    const matches = exactStock
      ? [exactStock, ...rankedMatches.filter((stock) => stock.symbol !== exactStock.symbol)]
      : rankedMatches;

    return response.status(200).json(matches.slice(0, 12));
  } catch (error) {
    return response.status(500).json({ message: 'Unable to search stocks right now.' });
  }
}

export async function getStocks(_request, response) {
  try {
    const stocks = buildLiveStocks().filter((stock) => featuredSymbols.includes(stock.symbol));
    return response.status(200).json(stocks);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to load stock data.' });
  }
}

export async function buyStock(request, response) {
  try {
    const { stockName, quantity, buyPrice, mode, predictedDirection, studyNotes, studyIndicators } = request.body;
    const normalizedSymbol = getCanonicalSymbol(stockName);

    if (!stockName || !quantity || !buyPrice) {
      return response.status(400).json({ message: 'Stock name, quantity, and buy price are required.' });
    }

    if (!stockUniverse[normalizedSymbol]) {
      return response.status(400).json({ message: 'Please choose a supported Indian stock.' });
    }

    if (Number(quantity) <= 0 || Number(buyPrice) <= 0) {
      return response.status(400).json({ message: 'Quantity and buy price must be greater than zero.' });
    }

    if (mode && !['investment', 'study'].includes(mode)) {
      return response.status(400).json({ message: 'Portfolio mode must be investment or study.' });
    }

    if (
      predictedDirection &&
      !['rise', 'fall', 'stable'].includes(predictedDirection)
    ) {
      return response.status(400).json({ message: 'Prediction direction must be rise, fall, or stable.' });
    }

    const portfolioItem = await Portfolio.create({
      userId: request.user._id,
      stockName: normalizedSymbol,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
      mode: mode || 'investment',
      predictedDirection: predictedDirection || null,
      studyNotes: String(studyNotes || '').trim(),
      studyIndicators: Array.isArray(studyIndicators)
        ? studyIndicators.filter(Boolean).slice(0, 6)
        : [],
    });

    return response.status(201).json(portfolioItem);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to add this stock to your portfolio.' });
  }
}

export async function getPortfolio(request, response) {
  try {
    const holdings = await Portfolio.find({ userId: request.user._id }).sort({ createdAt: -1 });
    const liveStocks = buildLiveStocks();
    const livePriceMap = liveStocks.reduce((accumulator, stock) => {
      accumulator[stock.symbol] = stock.currentPrice;
      return accumulator;
    }, {});

    const portfolio = holdings.map((holding) => {
      const normalizedSymbol = getCanonicalSymbol(holding.stockName);
      const currentPrice = livePriceMap[normalizedSymbol] ?? holding.buyPrice;
      const profit = Number(((currentPrice - holding.buyPrice) * holding.quantity).toFixed(2));
      const returnPercent = Number((((currentPrice - holding.buyPrice) / holding.buyPrice) * 100).toFixed(2));
      const predictionOutcome = evaluatePrediction(
        holding.predictedDirection,
        holding.buyPrice,
        currentPrice,
      );

      return {
        ...holding.toObject(),
        stockName: normalizedSymbol,
        currentPrice,
        profit,
        returnPercent,
        predictionOutcome,
      };
    });

    return response.status(200).json(portfolio);
  } catch (error) {
    return response.status(500).json({ message: 'Unable to load the portfolio.' });
  }
}
