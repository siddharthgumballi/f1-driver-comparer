import { motion } from 'framer-motion'
import type { DriverStats, Driver } from '../../types'
import { numberFmt, formatYearRange } from '../../lib/formatters'
import { splitConstructorStints, getConstructorCarUrl } from '../../lib/constructorImages'
import { GlassCard } from '../ui/GlassCard'

type ConstructorHistoryProps = {
  statsA: DriverStats
  statsB: DriverStats
  driverA: Driver
  driverB: Driver
}

export function ConstructorHistory({ statsA, statsB, driverA, driverB }: ConstructorHistoryProps) {
  const stintsA = splitConstructorStints(statsA.constructors, statsA.seasons || [])
  const stintsB = splitConstructorStints(statsB.constructors, statsB.seasons || [])

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-cyanDark">
          Constructor History
        </h2>
        <div className="text-xs text-f1-silver dark:text-zinc-400">
          Teams they drove for (by season)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver A */}
        <ConstructorColumn
          stints={stintsA}
          driver={driverA}
          activeYearTo={statsA.activeYears?.to}
          accent="red"
        />

        {/* Driver B */}
        <ConstructorColumn
          stints={stintsB}
          driver={driverB}
          activeYearTo={statsB.activeYears?.to}
          accent="cyan"
        />
      </div>
    </GlassCard>
  )
}

type ConstructorColumnProps = {
  stints: ReturnType<typeof splitConstructorStints>
  driver: Driver
  activeYearTo?: number
  accent: 'red' | 'cyan'
}

function ConstructorColumn({ stints, driver, activeYearTo, accent }: ConstructorColumnProps) {
  const accentColor = accent === 'red' ? 'text-f1-red' : 'text-accent-cyan'
  const badgeColor =
    accent === 'red'
      ? 'bg-f1-red/15 text-f1-red ring-f1-red/25'
      : 'bg-accent-cyan/15 text-accent-cyan ring-accent-cyan/25'
  const hoverBorder = accent === 'red' ? 'hover:border-f1-red/30' : 'hover:border-accent-cyan/30'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className={`text-sm font-medium ${accentColor}`}>
          {driver.givenName} {driver.familyName}
        </div>
        <div className="text-xs text-f1-silver dark:text-zinc-500">Most recent first</div>
      </div>
      <div className="space-y-3">
        {stints.map((stint, index) => {
          const seasonsSorted = [...stint.seasons].sort((x, y) => x - y)
          const from = seasonsSorted[0]
          const to = seasonsSorted[seasonsSorted.length - 1]
          const yearsLabel = formatYearRange(from, to)
          const carSrc = getConstructorCarUrl(activeYearTo || to, stint.constructorId, stint.name)

          return (
            <motion.div
              key={stint.stintId}
              className={`group relative overflow-hidden rounded-xl border border-zinc-300/60 dark:border-f1-steel/60 bg-white dark:bg-f1-black p-4 shadow-sm ${hoverBorder} transition-colors`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Car image for most recent stint */}
              {index === 0 && carSrc && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-40 opacity-60 group-hover:opacity-80 transition-opacity">
                  <img
                    src={carSrc}
                    alt={`${stint.name} ${activeYearTo || to} car`}
                    className="h-full w-full object-contain object-right"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/70 dark:to-f1-black/70" />
                </div>
              )}

              <div className="relative z-10 pr-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {stint.name}
                    </div>
                    <div
                      className={`mt-1 inline-flex items-center rounded-full ${badgeColor} px-2 py-0.5 text-xs font-medium ring-1`}
                    >
                      {yearsLabel}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <StatBadge label="Starts" value={stint.starts} />
                  <StatBadge label="Wins" value={stint.wins} />
                  <StatBadge label="Podiums" value={stint.podiums} />
                  <StatBadge label="Points" value={numberFmt(stint.points, 1)} />
                </div>

                <div className="mt-2 text-xs text-f1-silver dark:text-zinc-500">
                  Seasons: {seasonsSorted.join(', ')}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-full bg-zinc-200/60 dark:bg-f1-carbon/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-f1-steel/60">
      {label}: {value}
    </div>
  )
}
