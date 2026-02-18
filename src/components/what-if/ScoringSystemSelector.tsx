import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SCORING_SYSTEMS, createCustomSystem, type ScoringSystem } from '../../lib/pointsSystems'
import { GlassCard } from '../ui/GlassCard'

type Props = {
  selectedSystem: ScoringSystem
  onSelect: (system: ScoringSystem) => void
}

export function ScoringSystemSelector({ selectedSystem, onSelect }: Props) {
  const [showCustom, setShowCustom] = useState(false)
  const [customPoints, setCustomPoints] = useState<number[]>([25, 18, 15, 12, 10, 8, 6, 4, 2, 1])
  const [customFlBonus, setCustomFlBonus] = useState(0)
  const [customFlTopN, setCustomFlTopN] = useState(10)

  const handleApplyCustom = () => {
    const system = createCustomSystem(
      customPoints.filter((p) => p > 0),
      customFlBonus,
      customFlBonus > 0 ? customFlTopN : null
    )
    onSelect(system)
  }

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-f1-silver dark:text-zinc-400 font-mono mb-3">
        Scoring System
      </h3>

      <div className="max-h-64 overflow-auto space-y-1.5 pr-1">
        {SCORING_SYSTEMS.map((system) => (
          <button
            key={system.id}
            onClick={() => { onSelect(system); setShowCustom(false) }}
            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 ${
              selectedSystem.id === system.id
                ? 'bg-accent-gold/15 border-accent-gold/50 shadow-glow-gold'
                : 'bg-zinc-50 dark:bg-f1-carbon/50 border-zinc-200 dark:border-f1-steel/50 hover:border-accent-gold/30 hover:bg-accent-gold/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${
                selectedSystem.id === system.id
                  ? 'text-accent-gold'
                  : 'text-zinc-800 dark:text-zinc-200'
              }`}>
                {system.name}
              </span>
              {selectedSystem.id === system.id && (
                <div className="w-2 h-2 rounded-full bg-accent-gold" />
              )}
            </div>
            <p className="text-xs text-f1-silver mt-0.5">{system.description}</p>
          </button>
        ))}

        {/* Custom System Toggle */}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 ${
            selectedSystem.id === 'custom'
              ? 'bg-accent-gold/15 border-accent-gold/50 shadow-glow-gold'
              : 'bg-zinc-50 dark:bg-f1-carbon/50 border-zinc-200 dark:border-f1-steel/50 hover:border-accent-gold/30 hover:bg-accent-gold/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${
              selectedSystem.id === 'custom'
                ? 'text-accent-gold'
                : 'text-zinc-800 dark:text-zinc-200'
            }`}>
              Custom System
            </span>
            <svg
              className={`w-4 h-4 text-f1-silver transition-transform ${showCustom ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-xs text-f1-silver mt-0.5">Define your own scoring rules</p>
        </button>
      </div>

      {/* Custom System Editor */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-f1-steel/50 space-y-3">
              <div>
                <label className="text-xs text-f1-silver uppercase tracking-wider block mb-1.5">
                  Points per position (P1–P10)
                </label>
                <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                  {customPoints.map((pts, i) => (
                    <div key={i} className="relative">
                      <label className="text-[10px] text-f1-silver absolute -top-0.5 left-1 bg-white dark:bg-f1-carbon px-0.5">
                        P{i + 1}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={pts}
                        onChange={(e) => {
                          const next = [...customPoints]
                          next[i] = Math.max(0, parseInt(e.target.value) || 0)
                          setCustomPoints(next)
                        }}
                        className="w-full text-center text-sm font-mono py-1.5 pt-2 rounded-md bg-zinc-100 dark:bg-f1-black border border-zinc-300 dark:border-f1-steel text-zinc-900 dark:text-f1-white focus:ring-1 focus:ring-accent-gold focus:border-accent-gold outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-f1-silver uppercase tracking-wider block mb-1">
                    FL Bonus
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={customFlBonus}
                    onChange={(e) => setCustomFlBonus(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center text-sm font-mono py-1.5 rounded-md bg-zinc-100 dark:bg-f1-black border border-zinc-300 dark:border-f1-steel text-zinc-900 dark:text-f1-white focus:ring-1 focus:ring-accent-gold outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-f1-silver uppercase tracking-wider block mb-1">
                    FL Top N
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={customFlTopN}
                    onChange={(e) => setCustomFlTopN(Math.max(1, parseInt(e.target.value) || 10))}
                    disabled={customFlBonus === 0}
                    className="w-full text-center text-sm font-mono py-1.5 rounded-md bg-zinc-100 dark:bg-f1-black border border-zinc-300 dark:border-f1-steel text-zinc-900 dark:text-f1-white focus:ring-1 focus:ring-accent-gold outline-none disabled:opacity-40"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyCustom}
                className="w-full py-2 rounded-lg bg-accent-gold text-f1-black font-semibold text-sm hover:bg-amber-400 transition-colors"
              >
                Apply Custom System
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
