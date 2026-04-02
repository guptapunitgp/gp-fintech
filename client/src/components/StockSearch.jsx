import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

function StockSearch({
  searchQuery,
  setSearchQuery,
  searchResults,
  recentSearches,
  onSearch,
  onSelect,
  isSearching,
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localQuery);
      onSearch(localQuery);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [localQuery, onSearch, setSearchQuery]);

  const resultsToShow = localQuery.trim() ? searchResults : recentSearches;

  return (
    <div className="subtle-panel relative p-4">
      <label className="relative block">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={localQuery}
          onChange={(event) => setLocalQuery(event.target.value)}
          placeholder="Search Indian stocks like TCS, RELIANCE, INFY, HDFCBANK"
          className="field pl-12"
        />
      </label>

      {(resultsToShow.length > 0 || isSearching) && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950/90">
          {isSearching ? (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Searching stocks...</p>
          ) : (
            resultsToShow.map((stock) => (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => onSelect(stock)}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{stock.symbol}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stock.name}</p>
                </div>
                {'currentPrice' in stock && (
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default StockSearch;
