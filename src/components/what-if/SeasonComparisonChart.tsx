import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import type { NormalizerResult } from '../../lib/pointsSystems'
import type { ComparisonData } from '../../hooks/usePointsNormalizer'

type Props = {
  resultA: NormalizerResult | null
  resultB: NormalizerResult | null
  comparisonData: ComparisonData
}

export function SeasonComparisonChart({ resultA, resultB, comparisonData }: Props) {
  const { chartData } = comparisonData
  const hasDriverA = resultA !== null
  const hasDriverB = resultB !== null

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-amber-400 mb-6">
        Season-by-Season Comparison
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(107, 107, 107, 0.2)"
              vertical={false}
            />
            <XAxis
              dataKey="season"
              stroke="#6B6B6B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(107, 107, 107, 0.3)' }}
            />
            <YAxis
              stroke="#6B6B6B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: 'rgba(107, 107, 107, 0.3)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #2D2D2D',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#F1F1F1', marginBottom: '4px' }}
              itemStyle={{ padding: '2px 0' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />

            {/* Driver A lines */}
            {hasDriverA && (
              <>
                <Line
                  type="monotone"
                  dataKey="actualA"
                  name={`${resultA.driverName} (Actual)`}
                  stroke="#E10600"
                  strokeWidth={2}
                  dot={{ fill: '#E10600', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#E10600', strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="recalcA"
                  name={`${resultA.driverName} (Recalculated)`}
                  stroke="#E10600"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ fill: '#E10600', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#E10600', strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                  opacity={0.6}
                />
              </>
            )}

            {/* Driver B lines */}
            {hasDriverB && (
              <>
                <Line
                  type="monotone"
                  dataKey="actualB"
                  name={`${resultB.driverName} (Actual)`}
                  stroke="#00D4FF"
                  strokeWidth={2}
                  dot={{ fill: '#00D4FF', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#00D4FF', strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="recalcB"
                  name={`${resultB.driverName} (Recalculated)`}
                  stroke="#00D4FF"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ fill: '#00D4FF', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#00D4FF', strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                  opacity={0.6}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-f1-silver">
        <span>Solid line = actual points</span>
        <span>Dashed line = recalculated points</span>
      </div>
    </GlassCard>
  )
}
