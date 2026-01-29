import { useState, useMemo } from 'react'
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
import type { DriverStats, Driver } from '../../types'
import { GlassCard } from '../ui/GlassCard'

type MetricType = 'points' | 'wins' | 'podiums'

type CareerProgressionChartProps = {
  statsA: DriverStats
  statsB: DriverStats
  driverA: Driver
  driverB: Driver
}

export function CareerProgressionChart({
  statsA,
  statsB,
  driverA,
  driverB,
}: CareerProgressionChartProps) {
  const [metric, setMetric] = useState<MetricType>('points')

  const chartData = useMemo(() => {
    const allYears = new Set<number>()
    statsA.seasons.forEach((s) => allYears.add(s.season))
    statsB.seasons.forEach((s) => allYears.add(s.season))

    const years = Array.from(allYears).sort((a, b) => a - b)
    const aMap = new Map(statsA.seasons.map((s) => [s.season, s]))
    const bMap = new Map(statsB.seasons.map((s) => [s.season, s]))

    return years.map((year) => {
      const seasonA = aMap.get(year)
      const seasonB = bMap.get(year)

      return {
        year,
        [driverA.familyName]: seasonA?.[metric] ?? null,
        [driverB.familyName]: seasonB?.[metric] ?? null,
      }
    })
  }, [statsA.seasons, statsB.seasons, metric, driverA.familyName, driverB.familyName])

  const metricLabel = {
    points: 'Points',
    wins: 'Wins',
    podiums: 'Podiums',
  }

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-cyanDark">
          Career Progression
        </h2>
        <div className="flex gap-2">
          {(['points', 'wins', 'podiums'] as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                metric === m
                  ? 'bg-accent-cyan text-white shadow-glow-cyan'
                  : 'bg-zinc-100 dark:bg-f1-carbon text-f1-silver hover:bg-zinc-200 dark:hover:bg-f1-steel'
              }`}
              aria-pressed={metric === m}
            >
              {metricLabel[m]}
            </button>
          ))}
        </div>
      </div>

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
              dataKey="year"
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
            <Line
              type="monotone"
              dataKey={driverA.familyName}
              stroke="#E10600"
              strokeWidth={2}
              dot={{ fill: '#E10600', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#E10600', strokeWidth: 2, fill: '#fff' }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey={driverB.familyName}
              stroke="#00D4FF"
              strokeWidth={2}
              dot={{ fill: '#00D4FF', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#00D4FF', strokeWidth: 2, fill: '#fff' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-f1-steel/50 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-f1-red" />
          <span className="text-f1-silver">{driverA.givenName} {driverA.familyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-cyan" />
          <span className="text-f1-silver">{driverB.givenName} {driverB.familyName}</span>
        </div>
      </div>
    </GlassCard>
  )
}
