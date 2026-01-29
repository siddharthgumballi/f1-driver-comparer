import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Driver, RaceResult } from '../../types'
import { GlassCard } from '../ui/GlassCard'

type RaceByRaceBreakdownProps = {
  racesA: RaceResult[]
  racesB: RaceResult[]
  driverA: Driver
  driverB: Driver
}

type RaceComparison = {
  season: number
  round: number
  raceName: string
  posA: string | null
  posB: string | null
  winner: 'a' | 'b' | 'tie' | null
}

export function RaceByRaceBreakdown({
  racesA,
  racesB,
  driverA,
  driverB,
}: RaceByRaceBreakdownProps) {
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all')
  const [isExpanded, setIsExpanded] = useState(false)

  const raceComparisons = useMemo(() => {
    const aMap = new Map(racesA.map((r) => [`${r.season}-${r.round}`, r]))
    const comparisons: RaceComparison[] = []

    for (const raceB of racesB) {
      const key = `${raceB.season}-${raceB.round}`
      const raceA = aMap.get(key)
      if (raceA) {
        const posANum = parseInt(raceA.position, 10)
        const posBNum = parseInt(raceB.position, 10)
        let winner: 'a' | 'b' | 'tie' | null = null

        if (!isNaN(posANum) && !isNaN(posBNum)) {
          if (posANum < posBNum) winner = 'a'
          else if (posBNum < posANum) winner = 'b'
          else winner = 'tie'
        }

        comparisons.push({
          season: parseInt(raceA.season, 10),
          round: raceA.round,
          raceName: raceA.raceName || `Round ${raceA.round}`,
          posA: raceA.position,
          posB: raceB.position,
          winner,
        })
      }
    }

    return comparisons.sort((a, b) => b.season - a.season || b.round - a.round)
  }, [racesA, racesB])

  const seasons = useMemo(() => {
    const seasonSet = new Set(raceComparisons.map((r) => r.season))
    return Array.from(seasonSet).sort((a, b) => b - a)
  }, [raceComparisons])

  const filteredRaces = useMemo(() => {
    if (selectedSeason === 'all') return raceComparisons
    return raceComparisons.filter((r) => r.season === selectedSeason)
  }, [raceComparisons, selectedSeason])

  const displayedRaces = isExpanded ? filteredRaces : filteredRaces.slice(0, 10)

  if (raceComparisons.length === 0) return null

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-cyanDark">
          Race-by-Race Breakdown
        </h2>
        <select
          value={selectedSeason}
          onChange={(e) =>
            setSelectedSeason(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
          }
          className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-f1-carbon border border-zinc-200 dark:border-f1-steel focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
          aria-label="Filter by season"
        >
          <option value="all">All Seasons ({raceComparisons.length})</option>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season} ({raceComparisons.filter((r) => r.season === season).length})
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200/60 dark:border-f1-steel/60">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 dark:bg-f1-carbon text-f1-silver">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Race</th>
              <th className="px-4 py-2 text-center font-medium text-f1-red">
                {driverA.familyName}
              </th>
              <th className="px-4 py-2 text-center font-medium text-accent-cyan">
                {driverB.familyName}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/60 dark:divide-f1-steel/60">
            <AnimatePresence>
              {displayedRaces.map((race, index) => (
                <motion.tr
                  key={`${race.season}-${race.round}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-zinc-50 dark:hover:bg-f1-carbon/50"
                >
                  <td className="px-4 py-2">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {race.raceName}
                    </div>
                    <div className="text-xs text-f1-silver">{race.season}</div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <PositionBadge
                      position={race.posA}
                      isWinner={race.winner === 'a'}
                      accent="red"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <PositionBadge
                      position={race.posB}
                      isWinner={race.winner === 'b'}
                      accent="cyan"
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filteredRaces.length > 10 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full py-2 text-sm font-medium text-accent-cyan hover:text-accent-cyanDark transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 rounded-lg"
        >
          {isExpanded
            ? 'Show Less'
            : `Show All ${filteredRaces.length} Races`}
        </button>
      )}
    </GlassCard>
  )
}

function PositionBadge({
  position,
  isWinner,
  accent,
}: {
  position: string | null
  isWinner: boolean
  accent: 'red' | 'cyan'
}) {
  if (!position || position === 'R' || position === 'DNF') {
    return <span className="text-f1-silver">DNF</span>
  }

  const posNum = parseInt(position, 10)
  if (isNaN(posNum)) {
    return <span className="text-f1-silver">{position}</span>
  }

  const bgColor = isWinner
    ? accent === 'red'
      ? 'bg-f1-red text-white'
      : 'bg-accent-cyan text-white'
    : 'bg-zinc-100 dark:bg-f1-carbon text-zinc-700 dark:text-zinc-300'

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${bgColor} transition-colors`}
    >
      {posNum}
    </span>
  )
}
