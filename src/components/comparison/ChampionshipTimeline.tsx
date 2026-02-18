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

type ChampionshipGroup = {
  years: number[]
  startYear: number
  endYear: number
  label: string
}

// Group consecutive years together
function groupConsecutiveYears(years: number[]): ChampionshipGroup[] {
  if (years.length === 0) return []

  const sorted = [...years].sort((a, b) => a - b)
  const groups: ChampionshipGroup[] = []
  let currentGroup: number[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentGroup.push(sorted[i])
    } else {
      groups.push(createGroup(currentGroup))
      currentGroup = [sorted[i]]
    }
  }
  groups.push(createGroup(currentGroup))

  return groups
}

function createGroup(years: number[]): ChampionshipGroup {
  const startYear = years[0]
  const endYear = years[years.length - 1]
  const label = years.length === 1 ? String(startYear) : `${startYear}-${String(endYear).slice(-2)}`

  return { years, startYear, endYear, label }
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

  const groupsA = useMemo(() => groupConsecutiveYears(championshipYearsA), [championshipYearsA])
  const groupsB = useMemo(() => groupConsecutiveYears(championshipYearsB), [championshipYearsB])

  const totalChampionships = championshipYearsA.length + championshipYearsB.length
  if (totalChampionships === 0) return null

  // Calculate percentage position for a year
  const getYearPosition = (year: number) => {
    const range = timelineData.maxYear - timelineData.minYear
    if (range === 0) return 50
    return ((year - timelineData.minYear) / range) * 100
  }

  // Get the center position of a group
  const getGroupPosition = (group: ChampionshipGroup) => {
    const centerYear = (group.startYear + group.endYear) / 2
    return getYearPosition(centerYear)
  }

  // Get decade markers for cleaner display
  const decadeMarkers = useMemo(() => {
    const markers: number[] = []
    const startDecade = Math.floor(timelineData.minYear / 10) * 10
    const endDecade = Math.ceil(timelineData.maxYear / 10) * 10
    for (let year = startDecade; year <= endDecade; year += 5) {
      if (year >= timelineData.minYear && year <= timelineData.maxYear) {
        markers.push(year)
      }
    }
    return markers
  }, [timelineData.minYear, timelineData.maxYear])

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-yellow-500">
          Championship Timeline
        </h2>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-f1-red" />
            <span className="text-f1-silver">{driverA.familyName}</span>
            <span className="font-bold text-f1-red">{championshipYearsA.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-cyan" />
            <span className="text-f1-silver">{driverB.familyName}</span>
            <span className="font-bold text-accent-cyan">{championshipYearsB.length}</span>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative mx-0 sm:mx-4 overflow-x-auto">
        {/* Driver A Championships (above line) */}
        <div className="h-20 relative mb-4">
          {groupsA.map((group, index) => (
            <motion.div
              key={group.startYear}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${getGroupPosition(group)}%`, transform: 'translateX(-50%)' }}
            >
              {/* Trophies */}
              <div className="flex gap-1 mb-2">
                {group.years.map((year) => (
                  <Trophy key={year} color="red" size="sm" />
                ))}
              </div>
              {/* Year label */}
              <span className="text-xs font-bold text-f1-red whitespace-nowrap bg-f1-black/50 px-1.5 py-0.5 rounded">
                {group.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Timeline Line */}
        <div className="relative h-3 flex items-center">
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-f1-steel via-accent-gold/50 to-f1-steel rounded-full" />

          {/* Decade markers */}
          {decadeMarkers.map((year) => (
            <div
              key={year}
              className="absolute w-0.5 h-3 bg-f1-steel/60 rounded-full"
              style={{ left: `${getYearPosition(year)}%`, transform: 'translateX(-50%)' }}
            />
          ))}

          {/* Championship dots */}
          {[...championshipYearsA, ...championshipYearsB].map((year, idx) => (
            <motion.div
              key={`dot-${year}-${idx}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              className="absolute w-2.5 h-2.5 bg-accent-gold rounded-full shadow-lg"
              style={{ left: `${getYearPosition(year)}%`, transform: 'translateX(-50%)' }}
            />
          ))}
        </div>

        {/* Driver B Championships (below line) */}
        <div className="h-20 relative mt-4">
          {groupsB.map((group, index) => (
            <motion.div
              key={group.startYear}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.3, type: 'spring', stiffness: 200 }}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${getGroupPosition(group)}%`, transform: 'translateX(-50%)' }}
            >
              {/* Year label */}
              <span className="text-xs font-bold text-accent-cyan whitespace-nowrap bg-f1-black/50 px-1.5 py-0.5 rounded mb-2">
                {group.label}
              </span>
              {/* Trophies */}
              <div className="flex gap-1">
                {group.years.map((year) => (
                  <Trophy key={year} color="cyan" size="sm" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Year labels below */}
        <div className="relative h-8 mt-4">
          {decadeMarkers.map((year) => (
            <span
              key={`label-${year}`}
              className="absolute text-xs text-f1-silver transform -translate-x-1/2"
              style={{ left: `${getYearPosition(year)}%` }}
            >
              {year}
            </span>
          ))}
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
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'

  return (
    <svg
      className={`${sizeClass} ${colorClass} drop-shadow-lg`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2L9 9H2l6 5-2 8 6-4 6 4-2-8 6-5h-7L12 2z" />
    </svg>
  )
}
