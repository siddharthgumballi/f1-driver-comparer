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
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import type { DriverStats, Driver } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { NationalityFlag } from '../ui/NationalityFlag'

type MetricType = 'points' | 'wins' | 'podiums'
type ViewType = 'line' | 'pie'

// Colors for the drivers
const DRIVER_A_COLOR = '#E10600'
const DRIVER_B_COLOR = '#00D4FF'

// Custom active shape — bigger expansion, center text, glow ring
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props

  return (
    <g>
      {/* Glow ring around the active slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={payload.color}
        style={{ opacity: 0.5 }}
      />
      {/* Expanded active slice (+10px) */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
        }}
      />
      {/* Driver name in center */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={12}
        fontWeight={700}
      >
        {payload.name.split(' ').pop()}
      </text>
      {/* Value in center */}
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fill={payload.color}
        fontSize={16}
        fontWeight={900}
      >
        {payload.value.toLocaleString()}
      </text>
    </g>
  )
}

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
  const [view, setView] = useState<ViewType>('line')
  const [activeIndex, setActiveIndex] = useState(0)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)

  // Calculate totals for pie chart
  const pieData = useMemo(() => {
    const totalA = statsA.seasons.reduce((sum, s) => sum + (s[metric] || 0), 0)
    const totalB = statsB.seasons.reduce((sum, s) => sum + (s[metric] || 0), 0)

    return [
      {
        name: `${driverA.givenName} ${driverA.familyName}`,
        value: metric === 'points' ? Math.round(totalA * 10) / 10 : totalA,
        color: DRIVER_A_COLOR,
        nationality: driverA.nationality,
      },
      {
        name: `${driverB.givenName} ${driverB.familyName}`,
        value: metric === 'points' ? Math.round(totalB * 10) / 10 : totalB,
        color: DRIVER_B_COLOR,
        nationality: driverB.nationality,
      },
    ]
  }, [statsA.seasons, statsB.seasons, metric, driverA, driverB])

  const total = pieData[0].value + pieData[1].value
  const percentA = total > 0 ? (pieData[0].value / total) * 100 : 50
  const percentB = total > 0 ? (pieData[1].value / total) * 100 : 50

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

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    if (lockedIndex !== null) {
      setActiveIndex(lockedIndex)
    }
  }

  const onPieClick = (_: any, index: number) => {
    setLockedIndex((prev) => (prev === index ? null : index))
    setActiveIndex(index)
  }

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-cyanDark">
            Career Progression
          </h2>
          {/* View Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-zinc-300 dark:border-f1-steel/50">
            <button
              onClick={() => setView('line')}
              className={`px-3 py-1 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                view === 'line'
                  ? 'bg-accent-cyan text-white'
                  : 'bg-zinc-100 dark:bg-f1-carbon text-f1-silver hover:bg-zinc-200 dark:hover:bg-f1-steel'
              }`}
              aria-pressed={view === 'line'}
              title="Line Chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
              </svg>
              Line
            </button>
            <button
              onClick={() => setView('pie')}
              className={`px-3 py-1 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                view === 'pie'
                  ? 'bg-accent-cyan text-white'
                  : 'bg-zinc-100 dark:bg-f1-carbon text-f1-silver hover:bg-zinc-200 dark:hover:bg-f1-steel'
              }`}
              aria-pressed={view === 'pie'}
              title="Pie Chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Pie
            </button>
          </div>
        </div>
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
        {view === 'line' ? (
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
        ) : (
          <div className="h-full flex items-center justify-between gap-4 px-2">
            {/* Driver A Card - Left */}
            <div
              className={`flex-1 rounded-xl p-4 transition-all duration-300 ${
                activeIndex === 0
                  ? 'bg-gradient-to-br from-f1-red/20 to-f1-red/5 ring-2 ring-f1-red/50 shadow-lg shadow-f1-red/20'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
              onMouseEnter={() => setActiveIndex(0)}
              onMouseLeave={onPieLeave}
              onClick={() => onPieClick(null, 0)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-f1-red shadow-lg shadow-f1-red/50" />
                <NationalityFlag nationality={driverA.nationality} size="sm" />
                <span className="text-sm font-bold text-white truncate">
                  {driverA.givenName} {driverA.familyName}
                </span>
                {lockedIndex === 0 && (
                  <svg className="w-3 h-3 text-f1-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`a-${pieData[0].value}-${metric}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-3xl font-black text-f1-red mb-1"
                >
                  {pieData[0].value.toLocaleString()}
                </motion.div>
              </AnimatePresence>
              <div className="text-xs text-f1-silver">
                {percentA.toFixed(1)}% of total {metricLabel[metric].toLowerCase()}
              </div>
              {/* Animated percentage bar */}
              <div className="mt-2 h-1 rounded-full bg-zinc-700/50 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentA}%`,
                    background: `linear-gradient(to right, ${DRIVER_A_COLOR}, transparent)`,
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </div>
            </div>

            {/* Pie Chart - Center (no 3D tilt, bigger) */}
            <div
              className="w-64 h-full flex-shrink-0 relative"
              onMouseLeave={onPieLeave}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="pieGradientA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF4D40" />
                      <stop offset="50%" stopColor="#E10600" />
                      <stop offset="100%" stopColor="#8B0000" />
                    </linearGradient>
                    <linearGradient id="pieGradientB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#40FFFF" />
                      <stop offset="50%" stopColor="#00D4FF" />
                      <stop offset="100%" stopColor="#006699" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const PieComponent = Pie as any
                    return (
                      <PieComponent
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                        onClick={onPieClick}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                        animationDuration={600}
                        animationEasing="ease-out"
                      >
                        {pieData.map((_: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient${index === 0 ? 'A' : 'B'})`}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </PieComponent>
                    )
                  })()}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Driver B Card - Right */}
            <div
              className={`flex-1 rounded-xl p-4 transition-all duration-300 ${
                activeIndex === 1
                  ? 'bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/5 ring-2 ring-accent-cyan/50 shadow-lg shadow-accent-cyan/20'
                  : 'bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
              onMouseEnter={() => setActiveIndex(1)}
              onMouseLeave={onPieLeave}
              onClick={() => onPieClick(null, 1)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-accent-cyan shadow-lg shadow-accent-cyan/50" />
                <NationalityFlag nationality={driverB.nationality} size="sm" />
                <span className="text-sm font-bold text-white truncate">
                  {driverB.givenName} {driverB.familyName}
                </span>
                {lockedIndex === 1 && (
                  <svg className="w-3 h-3 text-accent-cyan flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={`b-${pieData[1].value}-${metric}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-3xl font-black text-accent-cyan mb-1"
                >
                  {pieData[1].value.toLocaleString()}
                </motion.div>
              </AnimatePresence>
              <div className="text-xs text-f1-silver">
                {percentB.toFixed(1)}% of total {metricLabel[metric].toLowerCase()}
              </div>
              {/* Animated percentage bar */}
              <div className="mt-2 h-1 rounded-full bg-zinc-700/50 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentB}%`,
                    background: `linear-gradient(to right, ${DRIVER_B_COLOR}, transparent)`,
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-f1-steel/50 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-f1-red" />
          <NationalityFlag nationality={driverA.nationality} size="sm" />
          <span className="text-f1-silver">{driverA.givenName} {driverA.familyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-cyan" />
          <NationalityFlag nationality={driverB.nationality} size="sm" />
          <span className="text-f1-silver">{driverB.givenName} {driverB.familyName}</span>
        </div>
      </div>
    </GlassCard>
  )
}
