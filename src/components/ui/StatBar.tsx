import { motion } from 'framer-motion'

type StatBarProps = {
  label: string
  valueA: number
  valueB: number
  total?: number
  showSubtext?: string
  driverAName?: string
  driverBName?: string
}

export function StatBar({
  label,
  valueA,
  valueB,
  total,
  showSubtext,
  driverAName = 'Driver A',
  driverBName = 'Driver B',
}: StatBarProps) {
  const denominator = total ?? valueA + valueB
  const percentA = denominator > 0 ? (valueA / denominator) * 100 : 0
  const percentB = denominator > 0 ? (valueB / denominator) * 100 : 0
  const percentOther = 100 - percentA - percentB

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
        <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        {showSubtext && (
          <span className="text-[10px] sm:text-xs text-f1-silver dark:text-zinc-400">
            {showSubtext}
          </span>
        )}
      </div>
      <div className="relative flex items-center h-6 sm:h-8 bg-zinc-200/50 dark:bg-f1-steel/50 rounded-full overflow-visible">
        {/* Driver A */}
        <motion.div
          className="group h-full bg-gradient-to-r from-f1-red to-f1-darkRed flex items-center justify-center text-white font-medium text-[10px] sm:text-sm transition-all duration-300 relative z-10 rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentA}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {valueA > 0 && <span className="px-2">{valueA}</span>}
          <div className="pointer-events-none absolute top-full mt-1 sm:mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-f1-carbon text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-white/10">
            {driverAName}
          </div>
        </motion.div>

        {/* Other/Middle section */}
        {percentOther > 0 && (
          <motion.div
            className="group h-full bg-f1-silver/60 dark:bg-f1-steel flex items-center justify-center text-white/80 font-medium text-[9px] sm:text-xs transition-all duration-300 relative z-10"
            initial={{ width: 0 }}
            animate={{ width: `${percentOther}%` }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            {denominator - valueA - valueB > 0 && (
              <span>{denominator - valueA - valueB}</span>
            )}
          </motion.div>
        )}

        {/* Driver B */}
        <motion.div
          className="group h-full bg-gradient-to-l from-accent-cyan to-accent-cyanDark flex items-center justify-center text-white font-medium text-[10px] sm:text-sm transition-all duration-300 relative z-10 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentB}%` }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          {valueB > 0 && <span className="px-2">{valueB}</span>}
          <div className="pointer-events-none absolute top-full mt-1 sm:mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-f1-carbon text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-white/10">
            {driverBName}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
