import { motion } from 'framer-motion'
import type { DriverStats } from '../../types'
import { numberFmt } from '../../lib/formatters'
import { getDriverCarImage } from '../../lib/constructorImages'
import { GlassCard } from '../ui/GlassCard'
import { DriverAvatar } from './DriverAvatar'

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
  const car = getDriverCarImage(stats)
  const accentColor = accent === 'red' ? 'text-f1-red' : 'text-accent-cyan'
  const lastSeason = stats.activeYears?.to ?? stats.seasons?.slice(-1)[0]?.season ?? null

  const getValue = (key: string): string => {
    if (key === 'dnfRate') {
      return stats.starts > 0 ? ((stats.dnfs / stats.starts) * 100).toFixed(1) + '%' : '0.0%'
    }
    const value = stats[key as keyof DriverStats]
    if (value === null || value === undefined) return '—'
    if (typeof value === 'number') {
      const row = statRows.find((r) => r.key === key)
      return numberFmt(value, row?.decimal ? 2 : 0)
    }
    return String(value)
  }

  return (
    <GlassCard variant={accent} className="p-5">
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
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-f1-silver dark:text-zinc-400 font-mono">
                {label}
              </p>
            </div>
          </div>
          {car?.src && (
            <div className="shrink-0 -mr-1 rounded-lg bg-zinc-100/80 dark:bg-f1-carbon/80 px-2 py-1">
              <img
                src={car.src}
                alt={car.alt}
                className="h-14 w-24 object-contain object-right"
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
              {statRows.map((row) => (
                <tr
                  key={row.key}
                  className="hover:bg-zinc-100/40 dark:hover:bg-f1-carbon/40 transition-colors duration-200"
                >
                  <td className="px-4 py-2 font-bold text-zinc-700 dark:text-zinc-300">
                    {row.label}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-100 font-medium font-mono">
                    {getValue(row.key)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </GlassCard>
  )
}
