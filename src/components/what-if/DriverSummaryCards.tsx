import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import type { NormalizerResult } from '../../lib/pointsSystems'

type Props = {
  resultA: NormalizerResult | null
  resultB: NormalizerResult | null
  selectedSeason?: string | null
}

function SummaryCard({
  result,
  variant,
  selectedSeason,
}: {
  result: NormalizerResult
  variant: 'red' | 'cyan'
  selectedSeason?: string | null
}) {
  const deltaColor =
    result.careerDelta > 0
      ? 'text-accent-neon'
      : result.careerDelta < 0
        ? 'text-f1-red'
        : 'text-f1-silver'

  const deltaPrefix = result.careerDelta > 0 ? '+' : ''
  const isSingleSeason = selectedSeason !== null && selectedSeason !== undefined
  const raceCount = result.seasons.reduce((s, ss) => s + ss.raceCount, 0)

  return (
    <GlassCard variant={variant} className="p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            variant === 'red' ? 'text-f1-red' : 'text-accent-cyan'
          }`}>
            {result.driverName}
          </h3>
          {isSingleSeason && (
            <span className="text-xs font-mono font-semibold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
              {selectedSeason}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-f1-silver uppercase tracking-wider mb-1">Actual</div>
            <div className="text-lg sm:text-2xl font-bold tabular-nums text-zinc-800 dark:text-f1-white">
              <AnimatedCounter value={result.careerActualTotal} decimals={1} />
            </div>
          </div>
          <div>
            <div className="text-xs text-f1-silver uppercase tracking-wider mb-1">Recalculated</div>
            <div className="text-lg sm:text-2xl font-bold tabular-nums text-zinc-800 dark:text-f1-white">
              <AnimatedCounter value={result.careerRecalculatedTotal} decimals={1} />
            </div>
          </div>
          <div>
            <div className="text-xs text-f1-silver uppercase tracking-wider mb-1">Difference</div>
            <div className={`text-lg sm:text-2xl font-bold tabular-nums ${deltaColor}`}>
              <AnimatedCounter
                value={result.careerDelta}
                decimals={1}
                prefix={deltaPrefix}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-f1-silver mt-3 text-center">
          {isSingleSeason
            ? `${raceCount} races in ${selectedSeason} under ${result.system.name}`
            : `${result.seasons.length} seasons analyzed under ${result.system.name}`
          }
        </p>
      </motion.div>
    </GlassCard>
  )
}

export function DriverSummaryCards({ resultA, resultB, selectedSeason }: Props) {
  if (!resultA && !resultB) return null

  return (
    <div className={`grid gap-4 lg:gap-8 ${resultA && resultB ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
      {resultA && <SummaryCard result={resultA} variant="red" selectedSeason={selectedSeason} />}
      {resultB && <SummaryCard result={resultB} variant="cyan" selectedSeason={selectedSeason} />}
    </div>
  )
}
