import { useState } from 'react';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

const timeframeOptions = ['1W', '1M', '1Y', '5Y'];

function getChartDomain(history, valueKey = 'price') {
  const values = history
    .map((entry) => Number(entry[valueKey]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return ['auto', 'auto'];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, max * 0.03, 1);
  const padding = spread * 0.18;

  return [
    Number((min - padding).toFixed(2)),
    Number((max + padding).toFixed(2)),
  ];
}

function getTickFormatter(range) {
  if (range === '1M') {
    return (label) => {
      const day = Number(String(label).replace('D', ''));
      return day % 5 === 0 || day === 1 ? label : '';
    };
  }

  if (range === '5Y') {
    return (label) => String(label).replace(' ', '\n');
  }

  return (label) => label;
}

function getYAxisTickFormatter(range) {
  if (range === '5Y' || range === '1Y') {
    return (value) => `${Math.round(value)}`;
  }

  return (value) => `${Math.round(value)}`;
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

function buildFallbackTimeframes(stock) {
  const basePrice = stock.currentPrice || stock.history?.[stock.history.length - 1]?.price || 1000;
  const seed = stock.symbol?.length || 3;

  return {
    '1W': buildSeries({
      basePrice,
      length: 7,
      labelFormatter: (index) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      amplitude: { primary: 18, secondary: 8 },
      drift: 1.2,
      phase: { primary: 0.9 + seed * 0.01, secondary: 0.45 + seed * 0.005 },
    }),
    '1M': buildSeries({
      basePrice,
      length: 22,
      labelFormatter: (index) => `D${index + 1}`,
      amplitude: { primary: 26, secondary: 12 },
      drift: 0.85,
      phase: { primary: 0.56 + seed * 0.008, secondary: 0.29 + seed * 0.006 },
    }),
    '1Y': buildSeries({
      basePrice,
      length: 12,
      labelFormatter: (index) =>
        ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][index],
      amplitude: { primary: 62, secondary: 26 },
      drift: 4.2,
      phase: { primary: 0.43 + seed * 0.007, secondary: 0.2 + seed * 0.004 },
    }),
    '5Y': buildSeries({
      basePrice,
      length: 20,
      labelFormatter: (index) => `Y${Math.floor(index / 4) + 1} Q${(index % 4) + 1}`,
      amplitude: { primary: 175, secondary: 88 },
      drift: 13,
      phase: { primary: 0.27 + seed * 0.005, secondary: 0.13 + seed * 0.003 },
    }),
  };
}

function calculateMovingAverage(history, windowSize = 7) {
  const slice = history.slice(-Math.min(windowSize, history.length));
  if (!slice.length) return 0;
  const total = slice.reduce((sum, entry) => sum + entry.price, 0);
  return total / slice.length;
}

function calculateTrend(history) {
  if (history.length < 2) return 'Stable';
  const first = history[0].price;
  const last = history[history.length - 1].price;
  const deltaPercent = ((last - first) / first) * 100;
  if (deltaPercent > 2) return 'Increasing';
  if (deltaPercent < -2) return 'Decreasing';
  return 'Stable';
}

function calculateVolatility(history) {
  if (history.length < 2) return 'Low';
  const changes = history.slice(1).map((entry, index) =>
    Math.abs(((entry.price - history[index].price) / history[index].price) * 100),
  );
  const averageMove = changes.reduce((sum, value) => sum + value, 0) / changes.length;
  if (averageMove > 3.5) return 'High';
  if (averageMove > 1.75) return 'Medium';
  return 'Low';
}

function buildCandleHistory(history) {
  return history.map((entry, index) => {
    const previousClose = history[index - 1]?.price ?? entry.price * 0.995;
    const open = Number(previousClose.toFixed(2));
    const close = Number(entry.price.toFixed(2));
    const upperWick = Math.max(close, open) * 0.006;
    const lowerWick = Math.min(close, open) * 0.005;

    return {
      label: entry.label,
      open,
      high: Number((Math.max(open, close) + upperWick).toFixed(2)),
      low: Number((Math.min(open, close) - lowerWick).toFixed(2)),
      bodyBottom: Number(Math.min(open, close).toFixed(2)),
      bodySize: Number(Math.abs(close - open).toFixed(2)),
      direction: close >= open ? 'bullish' : 'bearish',
    };
  });
}

function CustomCandleChart({ data, domain, movingAverage, selectedRange }) {
  const width = 900;
  const height = 360;
  const padding = { top: 16, right: 18, bottom: 42, left: 68 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const [minValue, maxValue] = domain;
  const range = Math.max(maxValue - minValue, 1);
  const slotWidth = plotWidth / Math.max(data.length, 1);
  const candleWidth = Math.max(Math.min(slotWidth * 0.48, 18), 8);
  const xTickFormatter = getTickFormatter(selectedRange);
  const yTicks = Array.from({ length: 5 }, (_, index) =>
    Number((maxValue - (range / 4) * index).toFixed(2)),
  );

  const getY = (value) => padding.top + ((maxValue - value) / range) * plotHeight;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />

      {yTicks.map((tick) => {
        const y = getY(tick);
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="rgba(148,163,184,0.16)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
            >
              {Math.round(tick)}
            </text>
          </g>
        );
      })}

      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="rgba(148,163,184,0.28)"
      />
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="rgba(148,163,184,0.28)"
      />

      <line
        x1={padding.left}
        y1={getY(movingAverage)}
        x2={width - padding.right}
        y2={getY(movingAverage)}
        stroke="#2563eb"
        strokeDasharray="6 6"
        strokeWidth="1.5"
      />

      {data.map((entry, index) => {
        const xCenter = padding.left + slotWidth * index + slotWidth / 2;
        const openY = getY(entry.open);
        const closeY = getY(entry.open + (entry.direction === 'bullish' ? entry.bodySize : -entry.bodySize));
        const highY = getY(entry.high);
        const lowY = getY(entry.low);
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 3);
        const bodyColor = entry.direction === 'bullish' ? '#16a34a' : '#e11d48';

        return (
          <g key={entry.label}>
            <line
              x1={xCenter}
              y1={highY}
              x2={xCenter}
              y2={lowY}
              stroke={bodyColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x={xCenter - candleWidth / 2}
              y={bodyY}
              width={candleWidth}
              height={bodyHeight}
              rx="4"
              fill={bodyColor}
              fillOpacity="0.92"
            />
          </g>
        );
      })}

      {data.map((entry, index) => {
        const xCenter = padding.left + slotWidth * index + slotWidth / 2;
        const label = xTickFormatter(entry.label);
        if (!label) {
          return null;
        }

        return (
          <text
            key={`${entry.label}-tick`}
            x={xCenter}
            y={height - 16}
            textAnchor="middle"
            fontSize="11"
            fill="#94a3b8"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

function StockDetails({ stock }) {
  const isPositive = stock.changePercent >= 0;
  const [chartMode, setChartMode] = useState('line');
  const [selectedRange, setSelectedRange] = useState('1M');
  const timeframes = stock.timeframes || buildFallbackTimeframes(stock);
  const activeHistory = timeframes[selectedRange] || stock.history;
  const activeCandleHistory = chartMode === 'candles'
    ? buildCandleHistory(activeHistory)
    : [];
  const activeMovingAverage = calculateMovingAverage(activeHistory, selectedRange === '1W' ? 3 : 7);
  const activeTrend = calculateTrend(activeHistory);
  const activeVolatility = calculateVolatility(activeHistory);
  const lineDomain = getChartDomain(activeHistory, 'price');
  const candleHighLowDomain = getChartDomain(
    activeCandleHistory.flatMap((entry) => [
      { price: entry.high },
      { price: entry.low },
    ]),
    'price',
  );
  const xTickFormatter = getTickFormatter(selectedRange);
  const yTickFormatter = getYAxisTickFormatter(selectedRange);
  const showDots = activeHistory.length <= 12;

  return (
    <section className="subtle-panel p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-300">
            {stock.symbol}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-950 dark:text-white">{stock.name}</h3>
          <p className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
            {formatCurrency(stock.currentPrice)}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
            isPositive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {isPositive ? '+' : ''}
          {formatPercent(stock.changePercent)} today
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Trend</p>
          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{activeTrend}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Moving Avg</p>
          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
            {formatCurrency(activeMovingAverage)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Volatility</p>
          <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{activeVolatility}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {timeframeOptions.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                selectedRange === range
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setChartMode('line')}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              chartMode === 'line'
                ? 'bg-slate-950 text-white dark:bg-brand-500'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Line chart
          </button>
          <button
            type="button"
            onClick={() => setChartMode('candles')}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              chartMode === 'candles'
                ? 'bg-slate-950 text-white dark:bg-brand-500'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Candle study
          </button>
        </div>
      </div>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'line' ? (
            <LineChart
              key={`${stock.symbol}-${selectedRange}-line`}
              data={activeHistory}
              margin={{ top: 12, right: 10, left: 0, bottom: 8 }}
            >
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                tickFormatter={xTickFormatter}
                minTickGap={selectedRange === '5Y' ? 22 : 12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                domain={lineDomain}
                tickFormatter={yTickFormatter}
                width={56}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={3}
                dot={showDots ? { fill: '#1d4ed8', r: 4, strokeWidth: 0 } : false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          ) : (
            <CustomCandleChart
              data={activeCandleHistory}
              domain={candleHighLowDomain}
              movingAverage={activeMovingAverage}
              selectedRange={selectedRange}
            />
          )}
        </ResponsiveContainer>
      </div>

      {chartMode === 'candles' && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Candle study view for {selectedRange} helps you inspect price body movement against the moving average for practice setups.
        </p>
      )}

      {chartMode === 'line' && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          The chart auto-scales for the {selectedRange} view so price moves are easier to read clearly.
        </p>
      )}
    </section>
  );
}

export default StockDetails;
