import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import EmptyState from './EmptyState';

const pieColors = ['#2563eb', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

function OverviewCharts({ monthlyTrend, categoryBreakdown }) {
  return (
    <div className="flex flex-col gap-6">
      
      <div className="subtle-panel p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="section-title">Monthly Balance Trend</h3>
          <p className="section-copy">
            Month-over-month balance movement based on your recorded transactions.
          </p>
        </div>

        {monthlyTrend.length === 0 ? (
          <EmptyState
            compact
            title="No balance trend yet"
            description="Add transactions to unlock a monthly trend view."
          />
        ) : (
          <div className="h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis
                  stroke="#94a3b8"
                  tickFormatter={(value) => `₹${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#cbd5e1',
                    backgroundColor: '#ffffff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: '#1d4ed8', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="subtle-panel p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="section-title">Expense Breakdown</h3>
          <p className="section-copy">
            Top categories contributing to total expenses.
          </p>
        </div>

        {categoryBreakdown.length === 0 ? (
          <EmptyState
            compact
            title="No expense data available"
            description="Expense categories will appear here once spending is recorded."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr,1fr]">
            
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: '12px',
                      borderColor: '#cbd5e1',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {categoryBreakdown.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

export default OverviewCharts;