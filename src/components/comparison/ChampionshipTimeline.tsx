import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DriverStats, Driver } from '../../types'
import { GlassCard } from '../ui/GlassCard'

type ChampionshipTimelineProps = {
  statsA: DriverStats
  statsB: DriverStats
  driverA: Driver
  driverB: Driver
  championshipYearsA: number[]
  championshipYearsB: number[]
}

export function ChampionshipTimeline({
  statsA,
  statsB,
  driverA,
  driverB,
  championshipYearsA,
  championshipYearsB,
}: ChampionshipTimelineProps) {
  const timelineData = useMemo(() => {
    const allYears = new Set<number>()
    statsA.seasons.forEach((s) => allYears.add(s.season))
    statsB.seasons.forEach((s) => allYears.add(s.season))

    const years = Array.from(allYears).sort((a, b) => a - b)
    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)

    return { years, minYear, maxYear }
  }, [statsA.seasons, statsB.seasons])

  const totalChampionships = championshipYearsA.length + championshipYearsB.length
  if (totalChampionships === 0) return null

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-yellow-500">
          Championship Timeline
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-f1-red" />
            <span className="text-f1-silver">{driverA.familyName}</span>
            <span className="font-bold text-f1-red">{championshipYearsA.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-accent-cyan" />
            <span className="text-f1-silver">{driverB.familyName}</span>
            <span className="font-bold text-accent-cyan">{championshipYearsB.length}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pt-16 pb-16 mx-8 overflow-visible">
        {/* Center line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-f1-steel via-accent-gold/50 to-f1-steel" />

        {/* Year markers */}
        <div className="relative flex justify-between items-center h-16">
          {timelineData.years.map((year, index) => {
            const isChampA = championshipYearsA.includes(year)
            const isChampB = championshipYearsB.includes(year)
            const position = (index / Math.max(timelineData.years.length - 1, 1)) * 100

            return (
              <div
                key={year}
                className="relative flex flex-col items-center"
                style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                {/* Driver A championship (above line) */}
                {isChampA && (
                  <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                    className="absolute bottom-8 flex flex-col items-center"
                  >
                    <Trophy color="red" />
                    <span className="text-xs font-bold text-f1-red mt-1">{year}</span>
                  </motion.div>
                )}

                {/* Timeline dot */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    isChampA || isChampB ? 'bg-accent-gold' : 'bg-f1-steel'
                  }`}
                />

                {/* Driver B championship (below line) */}
                {isChampB && (
                  <motion.div
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                    className="absolute top-8 flex flex-col items-center"
                  >
                    <span className="text-xs font-bold text-accent-cyan mb-1">{year}</span>
                    <Trophy color="cyan" />
                  </motion.div>
                )}

                {/* Year label for non-championship years (show every 5 years) */}
                {!isChampA && !isChampB && year % 5 === 0 && (
                  <span className="absolute top-8 text-[10px] text-f1-silver">{year}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-f1-steel/50 flex flex-wrap justify-center gap-6 text-xs text-f1-silver">
        <div className="flex items-center gap-2">
          <Trophy color="gold" size="sm" />
          <span>World Championship</span>
        </div>
        <div>
          {timelineData.minYear} - {timelineData.maxYear}
        </div>
      </div>
    </GlassCard>
  )
}

function Trophy({ color, size = 'md' }: { color: 'red' | 'cyan' | 'gold'; size?: 'sm' | 'md' }) {
  const colorClass =
    color === 'red'
      ? 'text-f1-red'
      : color === 'cyan'
        ? 'text-accent-cyan'
        : 'text-accent-gold'
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

  return (
    <svg
      className={`${sizeClass} ${colorClass}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2L9 9H2l6 5-2 8 6-4 6 4-2-8 6-5h-7L12 2z" />
    </svg>
  )
}
