import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DriverStats, ConstructorSummary } from '../../types'
import { getConstructorCarUrl } from '../../lib/constructorImages'
import { getTeamColor } from '../../lib/teamColors'
import { getCurrentTeam } from '../../lib/currentDriverTeams'
import { GlassCard } from '../ui/GlassCard'
import { DriverAvatar } from './DriverAvatar'
import { AnimatedCounter } from '../ui/AnimatedCounter'
import { TeamColorStrip } from '../ui/TeamColorBadge'

// Find the most recent constructor from a driver's history
function getLastConstructor(constructors: ConstructorSummary[] | undefined): ConstructorSummary | null {
  if (!constructors || constructors.length === 0) return null

  // Sort by the maximum season (most recent) in descending order
  const sorted = [...constructors].sort((a, b) => {
    const maxA = Math.max(...(a.seasons || [0]))
    const maxB = Math.max(...(b.seasons || [0]))
    return maxB - maxA
  })

  return sorted[0]
}

type DriverCardProps = {
  stats: DriverStats
  accent: 'red' | 'cyan'
  label: string
}

const statRows = [
  { key: 'starts', label: 'Races' },
  { key: 'wins', label: 'Wins' },
  { key: 'podiums', label: 'Podiums' },
  { key: 'poles', label: 'Poles' },
  { key: 'fastestLaps', label: 'Fastest Laps' },
  { key: 'dnfs', label: 'DNFs' },
  { key: 'dnfRate', label: 'DNF Rate', custom: true },
  { key: 'avgFinish', label: 'Avg Finish', decimal: true },
  { key: 'avgGrid', label: 'Avg Grid', decimal: true },
  { key: 'points', label: 'Points', decimal: true },
  { key: 'championships', label: 'World Championships' },
  { key: 'bestFinish', label: 'Best Finish' },
  { key: 'bestGrid', label: 'Best Grid' },
  { key: 'top10', label: 'Top 10 Finishes' },
  { key: 'frontRow', label: 'Front Row Starts' },
] as const

export function DriverCard({ stats, accent, label }: DriverCardProps) {
  const accentColor = accent === 'red' ? 'text-f1-red' : 'text-accent-cyan'
  const lastSeason = stats.activeYears?.to ?? stats.seasons?.slice(-1)[0]?.season ?? null

  // Get current team (2025/2026) for active drivers, or last team for retired drivers
  const currentTeamInfo = getCurrentTeam(stats.driver.driverId)
  const lastConstructor = useMemo(() => getLastConstructor(stats.constructors), [stats.constructors])

  // For current drivers, use their 2025 team. For retired drivers, use their last team
  const isCurrentDriver = !!currentTeamInfo
  const displayConstructorId = currentTeamInfo?.constructorId ?? lastConstructor?.constructorId
  const displayTeamName = currentTeamInfo?.name ?? lastConstructor?.name ?? displayConstructorId
  const teamColor = getTeamColor(displayConstructorId)

  // Get the car image - for current drivers use 2025 car, for retired drivers use their last season's car
  const carImage = useMemo(() => {
    if (isCurrentDriver) {
      // Current driver - use 2025 car
      if (!currentTeamInfo) return null
      return {
        src: getConstructorCarUrl(2025, currentTeamInfo.constructorId, currentTeamInfo.name),
        alt: `${currentTeamInfo.name} car`,
      }
    } else {
      // Retired driver - use their last constructor's final season car
      if (!lastConstructor || !lastConstructor.seasons || lastConstructor.seasons.length === 0) return null

      const lastSeasonWithConstructor = Math.max(...lastConstructor.seasons)
      return {
        src: getConstructorCarUrl(lastSeasonWithConstructor, lastConstructor.constructorId, lastConstructor.name),
        alt: `${lastConstructor.name} ${lastSeasonWithConstructor} car`,
      }
    }
  }, [isCurrentDriver, currentTeamInfo, lastConstructor])

  const getValue = (key: string): { value: number; isDecimal: boolean; suffix?: string } | string => {
    if (key === 'dnfRate') {
      const rate = stats.starts > 0 ? (stats.dnfs / stats.starts) * 100 : 0
      return { value: rate, isDecimal: true, suffix: '%' }
    }
    const value = stats[key as keyof DriverStats]
    if (value === null || value === undefined) return '—'
    if (typeof value === 'number') {
      const row = statRows.find((r) => r.key === key)
      return { value, isDecimal: row?.decimal ?? false }
    }
    return String(value)
  }

  return (
    <GlassCard variant={accent} className="p-5 relative overflow-hidden h-full">
      {/* Team Color Accent Strip */}
      <TeamColorStrip constructorId={displayConstructorId} position="top" thickness={3} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="relative mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <DriverAvatar driver={stats.driver} accent={accent} lastSeason={lastSeason} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-none tracking-tight font-display">
                <span className="text-zinc-900 dark:text-f1-white">{stats.driver.givenName}</span>{' '}
                <span className={`${accentColor} font-black uppercase`}>
                  {stats.driver.familyName}
                </span>
              </h2>
              {/* Team Badge - shows current team for active drivers, last team for retired */}
              {displayConstructorId && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: teamColor.primary }}
                  />
                  <span className="text-xs text-f1-silver font-medium">
                    {displayTeamName}
                    {!isCurrentDriver && lastConstructor?.seasons && lastConstructor.seasons.length > 0 && (
                      <span className="text-f1-steel ml-1">({Math.max(...lastConstructor.seasons)})</span>
                    )}
                  </span>
                </div>
              )}
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-f1-silver dark:text-zinc-400 font-mono">
                {label}
              </p>
            </div>
          </div>
          {carImage?.src && (
            <div className="shrink-0 -mr-1 rounded-lg bg-zinc-100/80 dark:bg-f1-carbon/80 px-2 py-1">
              <img
                src={carImage.src}
                alt={carImage.alt}
                className="h-10 w-16 sm:h-14 sm:w-24 object-contain object-right"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Stats Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200/60 dark:border-f1-steel/60 bg-gradient-to-br from-zinc-50/60 to-zinc-50/40 dark:from-f1-carbon/60 dark:to-f1-black/40 shadow-md">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-zinc-200/60 dark:divide-f1-steel/60">
              {statRows.map((row, index) => {
                const val = getValue(row.key)
                const isAnimatable = typeof val === 'object'

                return (
                  <tr
                    key={row.key}
                    className="hover:bg-zinc-100/40 dark:hover:bg-f1-carbon/40 transition-colors duration-200"
                  >
                    <td className="px-4 py-2 font-bold text-zinc-700 dark:text-zinc-300">
                      {row.label}
                    </td>
                    <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-100 font-medium font-mono">
                      {isAnimatable ? (
                        <AnimatedCounter
                          value={val.value}
                          decimals={val.isDecimal ? 1 : 0}
                          suffix={val.suffix || ''}
                          delay={index * 0.05}
                        />
                      ) : (
                        val
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </GlassCard>
  )
}
