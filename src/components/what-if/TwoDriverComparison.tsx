import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { StatBar } from '../ui/StatBar'
import type { NormalizerResult } from '../../lib/pointsSystems'
import type { ComparisonData } from '../../hooks/usePointsNormalizer'

type Props = {
  resultA: NormalizerResult
  resultB: NormalizerResult
  comparisonData: ComparisonData
  selectedSeason?: string | null
}

export function TwoDriverComparison({ resultA, resultB, comparisonData, selectedSeason }: Props) {
  const { benefitAnalysis, chartData } = comparisonData
  const isSingleSeason = selectedSeason !== null && selectedSeason !== undefined

  const barData = useMemo(() => {
    return chartData
      .filter((d) => d.recalcA !== undefined || d.recalcB !== undefined)
      .map((d) => ({
        season: d.season,
        [resultA.driverName]: d.recalcA ?? 0,
        [resultB.driverName]: d.recalcB ?? 0,
      }))
  }, [chartData, resultA.driverName, resultB.driverName])

  if (!benefitAnalysis) return null

  const benefitDriver = benefitAnalysis.benefitsMore === 'A' ? resultA : resultB
  const benefitColor = benefitAnalysis.benefitsMore === 'A' ? 'text-f1-red' : 'text-accent-cyan'
  const benefitBg = benefitAnalysis.benefitsMore === 'A' ? 'from-f1-red/10 to-transparent' : 'from-accent-cyan/10 to-transparent'

  const pointsLabel = isSingleSeason ? `${selectedSeason} Points (Recalculated)` : 'Career Points (Recalculated)'
  const totalsLabel = isSingleSeason ? `Recalculated ${selectedSeason} Totals` : 'Recalculated Career Totals'

  return (
    <div className="space-y-4">
      {/* Benefits Most callout */}
      {benefitAnalysis.benefitsMore !== 'tie' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className={`p-5 bg-gradient-to-r ${benefitBg}`}>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-black ${benefitColor}`}>
                {benefitDriver.driverName}
              </div>
              <div className="text-f1-silver text-sm">
                benefits more from {resultA.system.name} scoring
                {isSingleSeason && ` in ${selectedSeason}`}
              </div>
            </div>
            <div className="mt-2 text-sm text-f1-silver">
              Net advantage of{' '}
              <span className={`font-bold ${benefitColor}`}>
                {benefitAnalysis.magnitude.toFixed(1)} points
              </span>
              {' '}compared to the other driver's delta
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Stat Bars */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-f1-silver mb-4">
          {totalsLabel}
        </h3>
        <StatBar
          label={pointsLabel}
          valueA={resultA.careerRecalculatedTotal}
          valueB={resultB.careerRecalculatedTotal}
          driverAName={resultA.driverName}
          driverBName={resultB.driverName}
        />
        <StatBar
          label="Net Delta (Recalc - Actual)"
          valueA={Math.max(0, resultA.careerDelta)}
          valueB={Math.max(0, resultB.careerDelta)}
          driverAName={resultA.driverName}
          driverBName={resultB.driverName}
        />
      </GlassCard>

      {/* Grouped Bar Chart (hide for single season — redundant with stat bars) */}
      {!isSingleSeason && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-amber-400 mb-6">
            Recalculated Points by Season
          </h3>

          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
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
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey={resultA.driverName} fill="#E10600" radius={[2, 2, 0, 0]} />
                <Bar dataKey={resultB.driverName} fill="#00D4FF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
