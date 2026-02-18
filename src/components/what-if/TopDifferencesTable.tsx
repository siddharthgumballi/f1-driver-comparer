import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'
import type { NormalizerResult } from '../../lib/pointsSystems'

type Props = {
  resultA: NormalizerResult | null
  resultB: NormalizerResult | null
}

function DifferencesTable({
  result,
  variant,
}: {
  result: NormalizerResult
  variant: 'red' | 'cyan'
}) {
  const sorted = [...result.seasons]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10)

  return (
    <GlassCard variant={variant} className="p-5">
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
        variant === 'red' ? 'text-f1-red' : 'text-accent-cyan'
      }`}>
        {result.driverName} — Biggest Impact Seasons
      </h3>

      <div className="overflow-hidden rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-f1-silver uppercase tracking-wider border-b border-zinc-200 dark:border-f1-steel/50">
              <th className="text-left py-2 px-3">Season</th>
              <th className="text-right py-2 px-3">Actual</th>
              <th className="text-right py-2 px-3">Recalc</th>
              <th className="text-right py-2 px-3">Delta</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((season, i) => (
              <motion.tr
                key={season.season}
                initial={{ opacity: 0, x: variant === 'red' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="border-b border-zinc-100 dark:border-f1-steel/30 last:border-b-0"
              >
                <td className="py-2 px-3 font-mono text-zinc-800 dark:text-zinc-200">
                  {season.season}
                </td>
                <td className="py-2 px-3 text-right font-mono text-f1-silver">
                  {season.actualTotal.toFixed(1)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-zinc-800 dark:text-zinc-200">
                  {season.recalculatedTotal.toFixed(1)}
                </td>
                <td className={`py-2 px-3 text-right font-mono font-semibold ${
                  season.delta > 0
                    ? 'text-accent-neon'
                    : season.delta < 0
                      ? 'text-f1-red'
                      : 'text-f1-silver'
                }`}>
                  {season.delta > 0 ? '+' : ''}{season.delta.toFixed(1)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

export function TopDifferencesTable({ resultA, resultB }: Props) {
  if (!resultA && !resultB) return null

  return (
    <div className={`grid gap-4 lg:gap-8 ${resultA && resultB ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-xl mx-auto'}`}>
      {resultA && <DifferencesTable result={resultA} variant="red" />}
      {resultB && <DifferencesTable result={resultB} variant="cyan" />}
    </div>
  )
}
