import { useMemo, useState } from 'react';
import AIStockAssistantCard from '../components/AIStockAssistantCard';
import SectionHeader from '../components/common/SectionHeader';
import PredictionCard from '../components/PredictionCard';
import StatePanel from '../components/common/StatePanel';
import StockAnalysis from '../components/StockAnalysis';
import StockCard from '../components/StockCard';
import StockDetails from '../components/StockDetails';
import StockSearch from '../components/StockSearch';
import StockSimulatorPanel from '../components/StockSimulatorPanel';
import StudyJournalTable from '../components/StudyJournalTable';
import { useAiStore } from '../store/useAiStore';
import { useStockStore } from '../store/useStockStore';
import { formatCurrency } from '../utils/formatters';

function StocksPage() {
  const stocks = useStockStore((state) => state.stocks);
  const searchQuery = useStockStore((state) => state.searchQuery);
  const searchResults = useStockStore((state) => state.searchResults);
  const recentSearches = useStockStore((state) => state.recentSearches);
  const portfolio = useStockStore((state) => state.portfolio);
  const selectedSymbol = useStockStore((state) => state.selectedSymbol);
  const isLoadingStocks = useStockStore((state) => state.isLoadingStocks);
  const isLoadingPortfolio = useStockStore((state) => state.isLoadingPortfolio);
  const isSearching = useStockStore((state) => state.isSearching);
  const isBuying = useStockStore((state) => state.isBuying);
  const error = useStockStore((state) => state.error);
  const setSearchQuery = useStockStore((state) => state.setSearchQuery);
  const setSelectedSymbol = useStockStore((state) => state.setSelectedSymbol);
  const searchStocks = useStockStore((state) => state.searchStocks);
  const rememberSearch = useStockStore((state) => state.rememberSearch);
  const buyStock = useStockStore((state) => state.buyStock);
  const stockAnalysisBySymbol = useAiStore((state) => state.stockAnalysisBySymbol);
  const stockError = useAiStore((state) => state.stockError);
  const isLoadingStockAnalysis = useAiStore((state) => state.isLoadingStockAnalysis);
  const requestStockAnalysis = useAiStore((state) => state.requestStockAnalysis);
  const [form, setForm] = useState({
    mode: 'investment',
    stockName: 'TCS',
    quantity: 1,
    buyPrice: '',
    predictedDirection: 'rise',
    studyNotes: '',
    studyIndicators: ['candles', 'movingAverage'],
  });

  const selectedStock = useMemo(
    () => stocks.find((stock) => stock.symbol === selectedSymbol) || stocks[0],
    [stocks, selectedSymbol],
  );

  const holdingMap = useMemo(
    () =>
      portfolio.reduce((accumulator, item) => {
        const previous = accumulator[item.stockName] || { profit: 0 };
        accumulator[item.stockName] = {
          ...item,
          profit: previous.profit + item.profit,
        };
        return accumulator;
      }, {}),
    [portfolio],
  );

  const visibleCards = useMemo(() => {
    if (searchQuery.trim()) return searchResults;
    return stocks;
  }, [searchQuery, searchResults, stocks]);

  const investmentHoldings = useMemo(
    () => portfolio.filter((holding) => holding.mode !== 'study'),
    [portfolio],
  );
  const studyHoldings = useMemo(
    () => portfolio.filter((holding) => holding.mode === 'study'),
    [portfolio],
  );
  const portfolioProfit = investmentHoldings.reduce((sum, holding) => sum + holding.profit, 0);
  const activeAiStockAnalysis = selectedStock ? stockAnalysisBySymbol[selectedStock.symbol] : null;
  const resolvedStudyTrades = studyHoldings.filter((holding) => holding.predictionOutcome !== 'pending');
  const correctStudyTrades = resolvedStudyTrades.filter(
    (holding) => holding.predictionOutcome === 'correct',
  );
  const studyAccuracy = resolvedStudyTrades.length
    ? Math.round((correctStudyTrades.length / resolvedStudyTrades.length) * 100)
    : null;

  const handleBuy = async (event) => {
    event.preventDefault();
    if (!form.stockName || Number(form.quantity) <= 0 || Number(form.buyPrice) <= 0) {
      return;
    }

    await buyStock({
      stockName: form.stockName,
      quantity: Number(form.quantity),
      buyPrice: Number(form.buyPrice),
      mode: form.mode,
      predictedDirection: form.mode === 'study' ? form.predictedDirection : undefined,
      studyNotes: form.mode === 'study' ? form.studyNotes : '',
      studyIndicators: form.mode === 'study' ? form.studyIndicators : [],
    }).catch(() => null);
    setForm((current) => ({
      ...current,
      buyPrice: '',
      quantity: 1,
      studyNotes: '',
      studyIndicators: current.mode === 'study' ? current.studyIndicators : ['candles', 'movingAverage'],
    }));
  };

  const handleSearch = async (query) => {
    await searchStocks(query).catch(() => null);
  };

  const handleSelectStock = (stock) => {
    setSelectedSymbol(stock.symbol);
    rememberSearch(stock);
    setForm((current) => ({ ...current, stockName: stock.symbol }));
  };

  const handleToggleIndicator = (indicator) => {
    setForm((current) => {
      const isSelected = current.studyIndicators.includes(indicator);
      return {
        ...current,
        studyIndicators: isSelected
          ? current.studyIndicators.filter((item) => item !== indicator)
          : [...current.studyIndicators, indicator],
      };
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Stocks"
        title="Track Indian market positions"
        description="Search Indian stocks, review trend analytics, see lightweight prediction signals, and monitor portfolio profit or loss in one place."
      />

      <StockSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        recentSearches={recentSearches}
        onSearch={handleSearch}
        onSelect={handleSelectStock}
        isSearching={isSearching}
      />

      {isLoadingStocks ? (
        <StatePanel title="Loading stocks" description="Fetching the latest stock prices and market movement." />
      ) : error ? (
        <StatePanel title="Unable to load stocks" description={error} tone="danger" />
      ) : (
        <>
          {selectedStock ? (
            <div className="space-y-6">
              <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                <StockDetails stock={selectedStock} />

                <div className="space-y-6">
                  <PredictionCard
                    prediction={selectedStock.prediction}
                    trend={selectedStock.trend}
                    studyAccuracy={studyAccuracy}
                  />
                  <StockAnalysis stock={selectedStock} />
                  <AIStockAssistantCard
                    stock={selectedStock}
                    analysis={activeAiStockAnalysis}
                    error={stockError}
                    isLoading={isLoadingStockAnalysis}
                    onAnalyze={requestStockAnalysis}
                  />
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                <div className="subtle-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                    Selected Stock
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
                    {selectedStock.symbol}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {selectedStock.name} is currently {selectedStock.trend.toLowerCase()} with{' '}
                    {selectedStock.volatility.toLowerCase()} volatility.
                  </p>
                </div>

                <div className="subtle-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                    Portfolio Status
                  </p>
                  <h3
                    className={`mt-2 text-3xl font-extrabold ${
                      portfolioProfit >= 0
                        ? 'text-emerald-600 dark:text-emerald-300'
                        : 'text-rose-600 dark:text-rose-300'
                    }`}
                  >
                    {portfolioProfit >= 0 ? '+' : ''}
                    {formatCurrency(portfolioProfit)}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {investmentHoldings.length} real holding(s) currently tracked.
                  </p>
                </div>

                <div className="subtle-panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">
                    Study Lab
                  </p>
                  <h3 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
                    {studyHoldings.length}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Paper trade{studyHoldings.length === 1 ? '' : 's'} saved for learning.
                    {studyAccuracy !== null ? ` Accuracy: ${studyAccuracy}% right so far.` : ' Add one to start tracking your calls.'}
                  </p>
                </div>
              </section>

              <StockSimulatorPanel
                stocks={stocks}
                form={form}
                setForm={setForm}
                onToggleIndicator={handleToggleIndicator}
                onSubmit={handleBuy}
                isBuying={isBuying}
              />
            </div>
          ) : (
            <StatePanel
              title="No stock selected"
              description="Search and select a stock to view analysis and prediction details."
            />
          )}

          <section className="space-y-4">
            <div>
              <h3 className="section-title">Market Watchlist</h3>
              <p className="section-copy">
                Browse the filtered stock list and switch the active stock workspace above.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {visibleCards.length > 0 ? (
                visibleCards.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    holding={holdingMap[stock.symbol]}
                    isSelected={selectedStock?.symbol === stock.symbol}
                    onSelect={(symbol) => {
                      setSelectedSymbol(symbol);
                      const target = stocks.find((item) => item.symbol === symbol) || stock;
                      rememberSearch(target);
                      setForm((current) => ({ ...current, stockName: symbol }));
                    }}
                  />
                ))
              ) : (
                <div className="md:col-span-2 xl:col-span-4">
                  <StatePanel
                    title="No matching stocks"
                    description="Try another company name or symbol like TCS, RELIANCE, INFY, or HDFCBANK."
                  />
                </div>
              )}
            </div>
          </section>

          <section className="subtle-panel p-5 sm:p-6">
            <h3 className="section-title">Portfolio Holdings</h3>
            <p className="section-copy">Current profit or loss based on simulated live prices.</p>

            {isLoadingPortfolio ? (
              <div className="mt-6">
                <StatePanel title="Loading portfolio" description="Fetching your stock holdings." />
              </div>
            ) : investmentHoldings.length === 0 ? (
              <div className="mt-6">
                <StatePanel
                  title="No stocks in portfolio"
                  description="Buy a stock above to start tracking portfolio profit and loss."
                />
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Buy Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {investmentHoldings.map((holding) => (
                      <tr key={holding._id}>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-950 dark:text-white">{holding.stockName}</td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">{holding.quantity}</td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">{formatCurrency(holding.buyPrice)}</td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">{formatCurrency(holding.currentPrice)}</td>
                        <td className={`px-4 py-4 text-right text-sm font-bold ${holding.profit >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                          {holding.profit >= 0 ? '+' : ''}
                          {formatCurrency(holding.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {studyHoldings.length > 0 && <StudyJournalTable positions={studyHoldings} />}
        </>
      )}
    </div>
  );
}

export default StocksPage;
