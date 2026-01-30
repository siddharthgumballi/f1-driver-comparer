import { motion } from 'framer-motion'
import { AnimatedCounter } from './AnimatedCounter'

type ComparisonHighlightProps = {
  label: string
  valueA: number
  valueB: number
  betterIs: 'higher' | 'lower'
  suffix?: string
  decimals?: number
  showDifference?: boolean
  className?: string
}

export function ComparisonHighlight({
  label,
  valueA,
  valueB,
  betterIs,
  suffix = '',
  decimals = 0,
  showDifference = false,
  className = '',
}: ComparisonHighlightProps) {
  const aIsBetter = betterIs === 'higher' ? valueA > valueB : valueA < valueB
  const bIsBetter = betterIs === 'higher' ? valueB > valueA : valueB < valueA
  const isTie = valueA === valueB

  const difference = Math.abs(valueA - valueB)

  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${className}`}>
      {/* Driver A Value */}
      <motion.div
        className={`flex-1 text-right ${aIsBetter ? 'text-accent-neon font-bold' : bIsBetter ? 'text-f1-silver' : ''}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedCounter
          value={valueA}
          decimals={decimals}
          suffix={suffix}
          highlightBetter={betterIs}
          comparisonValue={valueB}
        />
        {aIsBetter && !isTie && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="ml-1"
          >
            <WinnerBadge />
          </motion.span>
        )}
      </motion.div>

      {/* Label */}
      <div className="flex-shrink-0 text-center min-w-24">
        <span className="text-xs uppercase tracking-wider text-f1-silver">{label}</span>
        {showDifference && !isTie && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-f1-steel mt-0.5"
          >
            {aIsBetter ? '+' : '-'}
            {decimals > 0 ? difference.toFixed(decimals) : difference}
            {suffix}
          </motion.div>
        )}
      </div>

      {/* Driver B Value */}
      <motion.div
        className={`flex-1 text-left ${bIsBetter ? 'text-accent-neon font-bold' : aIsBetter ? 'text-f1-silver' : ''}`}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {bIsBetter && !isTie && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mr-1"
          >
            <WinnerBadge />
          </motion.span>
        )}
        <AnimatedCounter
          value={valueB}
          decimals={decimals}
          suffix={suffix}
          highlightBetter={betterIs}
          comparisonValue={valueA}
        />
      </motion.div>
    </div>
  )
}

function WinnerBadge() {
  return (
    <svg className="w-3 h-3 inline text-accent-neon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// Compact stat row for comparison tables
type ComparisonStatRowProps = {
  label: string
  valueA: number | string | null
  valueB: number | string | null
  betterIs?: 'higher' | 'lower' | 'none'
  format?: (value: number | string | null) => string
}

export function ComparisonStatRow({
  label,
  valueA,
  valueB,
  betterIs = 'none',
  format = (v) => (v === null ? '-' : String(v)),
}: ComparisonStatRowProps) {
  const numA = typeof valueA === 'number' ? valueA : null
  const numB = typeof valueB === 'number' ? valueB : null

  const aIsBetter =
    betterIs !== 'none' && numA !== null && numB !== null
      ? betterIs === 'higher'
        ? numA > numB
        : numA < numB
      : false

  const bIsBetter =
    betterIs !== 'none' && numA !== null && numB !== null
      ? betterIs === 'higher'
        ? numB > numA
        : numB < numA
      : false

  return (
    <div className="flex items-center py-2 border-b border-f1-steel/30 last:border-0">
      <div
        className={`flex-1 text-right pr-4 tabular-nums ${aIsBetter ? 'text-accent-neon font-semibold' : bIsBetter ? 'text-f1-silver' : ''}`}
      >
        {format(valueA)}
        {aIsBetter && <span className="ml-1 text-accent-neon">★</span>}
      </div>
      <div className="flex-shrink-0 px-4 text-center text-xs uppercase tracking-wider text-f1-silver min-w-24">
        {label}
      </div>
      <div
        className={`flex-1 text-left pl-4 tabular-nums ${bIsBetter ? 'text-accent-neon font-semibold' : aIsBetter ? 'text-f1-silver' : ''}`}
      >
        {bIsBetter && <span className="mr-1 text-accent-neon">★</span>}
        {format(valueB)}
      </div>
    </div>
  )
}
