import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

interface SummaryProps {
  allotted: number;
  used: number;
  planned: number;
  remaining: number;
  projectedRemaining: number;
}

export function Summary({ allotted, used, planned, remaining, projectedRemaining }: SummaryProps) {
  const isNegativeProjection = projectedRemaining < 0;

  const chartData = [
    { name: 'Used', value: Math.max(0, used), color: '#6366f1' },
    { name: 'Planned', value: Math.max(0, planned), color: '#a5b4fc' },
    { name: 'Available', value: Math.max(0, projectedRemaining), color: '#e5e7eb' },
  ].filter(d => d.value > 0);

  // If over budget, show overflow
  if (isNegativeProjection) {
    chartData.length = 0;
    chartData.push(
      { name: 'Used', value: used, color: '#6366f1' },
      { name: 'Planned', value: planned, color: '#a5b4fc' },
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Chart */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${isNegativeProjection ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {projectedRemaining}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">projected</span>
          </div>
        </div>
      </div>

      {/* Negative Warning */}
      {isNegativeProjection && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">
            You've exceeded your PTO allotment by {Math.abs(projectedRemaining)} day{Math.abs(projectedRemaining) !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Allotted" value={allotted} color="text-gray-900 dark:text-white" />
        <StatCard label="Used" value={used} color="text-primary-600 dark:text-primary-400" />
        <StatCard label="Planned" value={planned} color="text-primary-400" />
        <StatCard
          label="Remaining"
          value={remaining}
          color={remaining < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
