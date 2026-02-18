import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'

type Props = {
  seasons: string[]
  selectedSeason: string | null
  onSelect: (season: string | null) => void
}

export function SeasonPicker({ seasons, selectedSeason, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Scroll to the active season pill when it changes
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
      container.scrollTo({ left, behavior: 'smooth' })
    }
  }, [selectedSeason])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-f1-silver dark:text-zinc-400 font-mono whitespace-nowrap">
            Championship Year
          </h3>
          {selectedSeason && (
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-accent-gold hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              Show all seasons
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin"
        >
          <button
            ref={selectedSeason === null ? activeRef : undefined}
            onClick={() => onSelect(null)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
              selectedSeason === null
                ? 'bg-accent-gold/15 border-accent-gold/50 text-accent-gold shadow-glow-gold'
                : 'bg-zinc-100 dark:bg-f1-carbon border-zinc-300 dark:border-f1-steel text-f1-silver hover:border-accent-gold/30 hover:text-accent-gold'
            }`}
          >
            All
          </button>
          {seasons.map((season) => (
            <button
              key={season}
              ref={selectedSeason === season ? activeRef : undefined}
              onClick={() => onSelect(season)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-mono font-semibold rounded-full border transition-all duration-200 ${
                selectedSeason === season
                  ? 'bg-accent-gold/15 border-accent-gold/50 text-accent-gold shadow-glow-gold'
                  : 'bg-zinc-100 dark:bg-f1-carbon border-zinc-300 dark:border-f1-steel text-f1-silver hover:border-accent-gold/30 hover:text-accent-gold'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}
