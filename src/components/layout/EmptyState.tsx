import { motion } from 'framer-motion'
import type { Driver } from '../../types'

type PopularComparison = {
  label: string
  driverA: { driverId: string; givenName: string; familyName: string }
  driverB: { driverId: string; givenName: string; familyName: string }
}

const POPULAR_COMPARISONS: PopularComparison[] = [
  {
    label: 'Hamilton vs Verstappen',
    driverA: { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton' },
    driverB: { driverId: 'max_verstappen', givenName: 'Max', familyName: 'Verstappen' },
  },
  {
    label: 'Senna vs Prost',
    driverA: { driverId: 'senna', givenName: 'Ayrton', familyName: 'Senna' },
    driverB: { driverId: 'prost', givenName: 'Alain', familyName: 'Prost' },
  },
  {
    label: 'Schumacher vs Hamilton',
    driverA: { driverId: 'michael_schumacher', givenName: 'Michael', familyName: 'Schumacher' },
    driverB: { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton' },
  },
  {
    label: 'Leclerc vs Norris',
    driverA: { driverId: 'leclerc', givenName: 'Charles', familyName: 'Leclerc' },
    driverB: { driverId: 'norris', givenName: 'Lando', familyName: 'Norris' },
  },
]

type EmptyStateProps = {
  onSelectComparison: (driverA: Driver, driverB: Driver) => void
}

export function EmptyState({ onSelectComparison }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* F1 Helmet Illustration */}
      <motion.div
        className="relative mb-8"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-32 h-32 relative">
          {/* Helmet base */}
          <div className="absolute inset-0 bg-gradient-to-br from-f1-red to-f1-darkRed rounded-full opacity-90" />
          <div className="absolute inset-2 bg-gradient-to-br from-f1-carbon to-f1-black rounded-full" />

          {/* Visor */}
          <div className="absolute top-1/3 left-1/4 right-1/4 h-1/4 bg-gradient-to-r from-accent-cyan/50 to-accent-cyan/30 rounded-full opacity-80" />

          {/* Reflection */}
          <div className="absolute top-4 left-6 w-8 h-2 bg-white/20 rounded-full blur-sm" />

          {/* VS badge */}
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-f1-carbon rounded-full border-2 border-accent-cyan flex items-center justify-center shadow-glow-cyan">
            <span className="text-accent-cyan font-black text-sm">VS</span>
          </div>
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold text-zinc-900 dark:text-f1-white mb-2">
        Select Two Drivers to Compare
      </h2>
      <p className="text-f1-silver dark:text-zinc-400 text-center max-w-md mb-8">
        Choose any two Formula 1 drivers from history to see their stats side by side
      </p>

      {/* Quick select buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <p className="text-xs font-medium text-f1-silver uppercase tracking-wide text-center mb-2">
          Popular Comparisons
        </p>
        {POPULAR_COMPARISONS.map((comparison) => (
          <motion.button
            key={comparison.label}
            onClick={() => onSelectComparison(comparison.driverA as Driver, comparison.driverB as Driver)}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-f1-carbon/80 to-f1-black/90 dark:from-f1-carbon dark:to-f1-black border border-f1-steel/50 hover:border-accent-cyan/50 text-white font-medium transition-all duration-200 hover:shadow-glow-cyan group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-f1-red">{comparison.driverA.familyName}</span>
              <span className="text-f1-silver group-hover:text-accent-cyan transition-colors">vs</span>
              <span className="text-accent-cyan">{comparison.driverB.familyName}</span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Or text */}
      <div className="flex items-center gap-4 my-6 w-full max-w-sm">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-f1-steel/50" />
        <span className="text-xs text-f1-silver uppercase">or</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-f1-steel/50" />
      </div>

      <p className="text-sm text-f1-silver">
        Use the dropdowns above to select any drivers
      </p>
    </motion.div>
  )
}
