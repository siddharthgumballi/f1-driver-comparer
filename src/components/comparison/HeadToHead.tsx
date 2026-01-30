import { motion } from 'framer-motion'
import type { HeadToHead as HeadToHeadType, Driver } from '../../types'
import { GlassCard } from '../ui/GlassCard'
import { StatBar } from '../ui/StatBar'
import { Tooltip } from '../ui/Tooltip'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { NationalityFlag } from '../ui/NationalityFlag'

type HeadToHeadProps = {
  h2h: HeadToHeadType
  driverA: Driver
  driverB: Driver
}

export function HeadToHead({ h2h, driverA, driverB }: HeadToHeadProps) {
  const driverAName = `${driverA.givenName} ${driverA.familyName}`
  const driverBName = `${driverB.givenName} ${driverB.familyName}`

  return (
    <GlassCard className="p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-cyanDark">
            Head to Head - {h2h.racesTogether} Races
          </h2>
          <div className="sm:ml-auto">
            <Tooltip
              content="Compares drivers in races where they competed together"
              position="left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 text-f1-silver hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Tooltip>
          </div>
        </div>

        {/* Wins Comparison */}
        <StatBar
          label="Wins"
          valueA={h2h.a.wins}
          valueB={h2h.b.wins}
          total={h2h.racesTogether}
          driverAName={driverAName}
          driverBName={driverBName}
        />

        {/* Head to Head Comparison */}
        <StatBar
          label="Head to Head"
          valueA={h2h.a.finishedAhead}
          valueB={h2h.b.finishedAhead}
          total={h2h.bothFinished}
          showSubtext={`${h2h.bothFinished} race${h2h.bothFinished !== 1 ? 's' : ''} both finished`}
          driverAName={driverAName}
          driverBName={driverBName}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-6">
          {/* Driver A Stats */}
          <div className="space-y-2">
            <div className="text-center font-medium text-f1-red text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <NationalityFlag nationality={driverA.nationality} size="sm" />
              {driverAName}
            </div>
            <StatCard
              value={h2h.a.wins}
              label="Wins"
              comparisonValue={h2h.b.wins}
              betterIs="higher"
            />
            <StatCard
              value={h2h.a.points}
              label="Points"
              comparisonValue={h2h.b.points}
              betterIs="higher"
            />
            <StatCard
              value={h2h.a.avgFinish}
              label="Avg. Finish"
              comparisonValue={h2h.b.avgFinish}
              betterIs="lower"
              decimals={1}
            />
          </div>

          {/* VS Separator */}
          <div className="flex items-center justify-center py-4 sm:py-0">
            <motion.div
              className="text-2xl sm:text-3xl font-black text-f1-silver/60 dark:text-f1-steel"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              VS
            </motion.div>
          </div>

          {/* Driver B Stats */}
          <div className="space-y-2">
            <div className="text-center font-medium text-accent-cyan text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <NationalityFlag nationality={driverB.nationality} size="sm" />
              {driverBName}
            </div>
            <StatCard
              value={h2h.b.wins}
              label="Wins"
              comparisonValue={h2h.a.wins}
              betterIs="higher"
            />
            <StatCard
              value={h2h.b.points}
              label="Points"
              comparisonValue={h2h.a.points}
              betterIs="higher"
            />
            <StatCard
              value={h2h.b.avgFinish}
              label="Avg. Finish"
              comparisonValue={h2h.a.avgFinish}
              betterIs="lower"
              decimals={1}
            />
          </div>
        </div>
      </motion.div>
    </GlassCard>
  )
}

type StatCardProps = {
  value: number | null
  label: string
  comparisonValue?: number | null
  betterIs?: 'higher' | 'lower'
  decimals?: number
}

function StatCard({ value, label, comparisonValue, betterIs, decimals = 0 }: StatCardProps) {
  // Determine if this value is better
  const isBetter =
    value !== null &&
    comparisonValue !== null &&
    betterIs &&
    (betterIs === 'higher' ? value > (comparisonValue ?? 0) : value < (comparisonValue ?? Infinity))

  const isWorse =
    value !== null &&
    comparisonValue !== null &&
    betterIs &&
    (betterIs === 'higher' ? value < (comparisonValue ?? 0) : value > (comparisonValue ?? 0))

  return (
    <div
      className={`bg-zinc-100 dark:bg-f1-carbon/50 rounded-lg p-2 sm:p-4 space-y-1 sm:space-y-3 border transition-colors ${
        isBetter
          ? 'border-accent-neon/50 bg-accent-neon/5'
          : 'border-zinc-200/50 dark:border-f1-steel/50'
      }`}
    >
      <div
        className={`text-center text-lg sm:text-2xl font-bold font-mono leading-tight ${
          isBetter ? 'text-accent-neon' : isWorse ? 'text-f1-silver' : ''
        }`}
      >
        {value !== null ? (
          <AnimatedCounter value={value} decimals={decimals} />
        ) : (
          '—'
        )}
        {isBetter && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="ml-1 text-accent-neon"
          >
            ★
          </motion.span>
        )}
      </div>
      <div className="text-center text-[10px] sm:text-sm text-f1-silver">{label}</div>
    </div>
  )
}
