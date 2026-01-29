import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SeasonStat } from '../../types'
import { numberFmt } from '../../lib/formatters'

type SeasonBreakdownProps = {
  seasons: SeasonStat[]
  accent: 'red' | 'cyan'
}

export function SeasonBreakdown({ seasons, accent }: SeasonBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const barColor = accent === 'red' ? 'bg-f1-red' : 'bg-accent-cyan'
  const barBgColor = accent === 'red' ? 'bg-f1-red/30' : 'bg-accent-cyan/30'
  const pointsBarColor = accent === 'red' ? 'bg-accent-neon' : 'bg-accent-gold'
  const pointsBarBgColor = accent === 'red' ? 'bg-accent-neon/30' : 'bg-accent-gold/30'

  const sortedSeasons = [...seasons].sort((a, b) => b.season - a.season)
  const maxWins = Math.max(...seasons.map((s) => s.wins), 1)
  const maxPoints = Math.max(...seasons.map((s) => s.points), 1)

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/60 dark:border-f1-steel/60 bg-gradient-to-br from-zinc-50/50 to-zinc-50/30 dark:from-f1-carbon/50 dark:to-f1-black/30 shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 pt-4 pb-3 flex items-center justify-center hover:bg-zinc-100/50 dark:hover:bg-f1-carbon/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
        aria-expanded={isOpen}
        aria-controls="season-breakdown"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-f1-silver dark:text-zinc-400 font-mono">
          Season-by-season breakdown
        </h3>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-f1-silver dark:text-zinc-400 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="season-breakdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full min-w-[400px] text-[10px]">
                  <thead className="bg-zinc-100/70 dark:bg-f1-carbon/70 text-f1-silver dark:text-zinc-400">
                    <tr>
                      <th className="py-1.5 text-left font-medium">Season</th>
                      <th className="py-1.5 text-center font-medium">Starts</th>
                      <th className="py-1.5 text-center font-medium">Wins</th>
                      <th className="py-1.5 text-center font-medium">Podiums</th>
                      <th className="py-1.5 text-center font-medium">Poles</th>
                      <th className="py-1.5 text-center font-medium">Fastest</th>
                      <th className="py-1.5 text-center font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-f1-steel/60">
                    {sortedSeasons.map((season) => (
                      <tr
                        key={season.season}
                        className="hover:bg-zinc-100/60 dark:hover:bg-f1-carbon/60 transition-colors"
                      >
                        <td className="py-1.5 text-left text-zinc-800 dark:text-zinc-200 font-medium font-mono">
                          {season.season}
                        </td>
                        <td className="py-1.5 text-center text-zinc-800 dark:text-zinc-200">
                          {season.starts}
                        </td>
                        <td className="py-1.5 text-center text-zinc-800 dark:text-zinc-200">
                          <div className="flex flex-col items-center">
                            {season.wins}
                            {season.wins > 0 && (
                              <div className={`mt-0.5 h-1 w-full ${barBgColor} rounded-full overflow-hidden`}>
                                <div
                                  className={`h-full ${barColor} rounded-full`}
                                  style={{ width: `${(season.wins / maxWins) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 text-center text-zinc-800 dark:text-zinc-200">
                          {season.podiums}
                        </td>
                        <td className="py-1.5 text-center text-zinc-800 dark:text-zinc-200">
                          {season.poles}
                        </td>
                        <td className="py-1.5 text-center text-zinc-800 dark:text-zinc-200">
                          {season.fastestLaps}
                        </td>
                        <td className="py-1.5 text-center text-zinc-800 dark:text-zinc-200">
                          <div className="flex flex-col items-center">
                            {numberFmt(season.points, 1)}
                            {season.points > 0 && (
                              <div className={`mt-0.5 h-1 w-full ${pointsBarBgColor} rounded-full overflow-hidden`}>
                                <div
                                  className={`h-full ${pointsBarColor} rounded-full`}
                                  style={{ width: `${(season.points / maxPoints) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
