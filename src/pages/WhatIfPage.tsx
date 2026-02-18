import { motion, AnimatePresence } from 'framer-motion'
import DriverSelect from '../components/DriverSelect'
import { GlassCard } from '../components/ui/GlassCard'
import { F1CarLoader } from '../components/ui/F1CarLoader'
import { DriverAvatar } from '../components/driver/DriverAvatar'
import { useDarkMode } from '../hooks/useDarkMode'
import { usePointsNormalizer } from '../hooks/usePointsNormalizer'
import type { Driver } from '../types'
import {
  WhatIfHeader,
  ScoringSystemSelector,
  DriverSummaryCards,
  SeasonComparisonChart,
  TopDifferencesTable,
  TwoDriverComparison,
  SeasonPicker,
} from '../components/what-if'

function DriverPreview({
  driver,
  accent,
  champYears,
  lastSeason,
}: {
  driver: Driver
  accent: 'red' | 'cyan'
  champYears: number[]
  lastSeason: number | null
}) {
  const accentColor = accent === 'red' ? 'text-f1-red' : 'text-accent-cyan'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 mt-4"
    >
      <DriverAvatar
        driver={driver}
        accent={accent}
        lastSeason={lastSeason}
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <div className={`text-lg font-bold ${accentColor} truncate`}>
          {driver.givenName} {driver.familyName}
        </div>
        <div className="text-xs text-f1-silver mt-0.5">
          {driver.nationality}
          {driver.permanentNumber && ` · #${driver.permanentNumber}`}
        </div>
        {champYears.length > 0 && (
          <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-accent-gold/15 border border-accent-gold/30">
            <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3h14l-1.5 6H20a1 1 0 011 1v1a5 5 0 01-3.5 4.77V17h1a1 1 0 110 2H5.5a1 1 0 110-2h1v-1.23A5 5 0 013 11v-1a1 1 0 011-1h2.5L5 3zm3.5 0l1 4h5l1-4h-7zM7 11H5v.5A3 3 0 007.5 14.37L7 11zm10 0l-.5 3.37A3 3 0 0019 11.5V11h-2z" />
            </svg>
            <span className="text-xs font-bold text-accent-gold">
              {champYears.length}x World Champion
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function WhatIfPage() {
  const { darkMode, setDarkMode } = useDarkMode()
  const {
    driverA,
    driverB,
    setDriverA,
    setDriverB,
    selectedSystem,
    setSelectedSystem,
    selectedSeason,
    setSelectedSeason,
    availableSeasons,
    resultA,
    resultB,
    loadingA,
    loadingB,
    error,
    comparisonData,
    champYearsA,
    champYearsB,
    lastSeasonA,
    lastSeasonB,
  } = usePointsNormalizer()

  const isLoading = loadingA || loadingB
  const hasResults = resultA || resultB
  const hasBothDrivers = resultA && resultB
  const isSingleSeason = selectedSeason !== null

  return (
    <>
      <div className="no-print">
        <WhatIfHeader darkMode={darkMode} onDarkModeChange={setDarkMode} />
      </div>

      {/* Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mb-8 relative z-[100]">
        <GlassCard variant="red" className="p-6 relative z-[103]">
          <DriverSelect
            label="Driver A (optional)"
            value={driverA}
            onChange={setDriverA}
            disabled={loadingA}
          />
          <AnimatePresence mode="wait">
            {driverA && !loadingA && (
              <DriverPreview
                key={driverA.driverId}
                driver={driverA}
                accent="red"
                champYears={champYearsA}
                lastSeason={lastSeasonA}
              />
            )}
          </AnimatePresence>
        </GlassCard>

        <GlassCard variant="cyan" className="p-6 relative z-[102]">
          <DriverSelect
            label="Driver B (optional)"
            value={driverB}
            onChange={setDriverB}
            disabled={loadingB}
          />
          <AnimatePresence mode="wait">
            {driverB && !loadingB && (
              <DriverPreview
                key={driverB.driverId}
                driver={driverB}
                accent="cyan"
                champYears={champYearsB}
                lastSeason={lastSeasonB}
              />
            )}
          </AnimatePresence>
        </GlassCard>

        <div className="relative z-[101]">
          <ScoringSystemSelector
            selectedSystem={selectedSystem}
            onSelect={setSelectedSystem}
          />
        </div>
      </div>

      {/* Season Filter (shown once data is loaded) */}
      {!isLoading && availableSeasons.length > 0 && (
        <div className="mb-8">
          <SeasonPicker
            seasons={availableSeasons}
            selectedSeason={selectedSeason}
            onSelect={setSelectedSeason}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <F1CarLoader
            variant={loadingA ? 'red' : 'cyan'}
            message="Recalculating points..."
          />
        </div>
      )}

      {/* Error Display */}
      {!isLoading && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-xl bg-f1-red/10 border border-f1-red/30 text-center"
        >
          <p className="text-f1-red font-medium">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      {!isLoading && hasResults && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <DriverSummaryCards
            resultA={resultA}
            resultB={resultB}
            selectedSeason={selectedSeason}
          />

          {/* Season Comparison Chart (hide when single season — chart is redundant with 1 data point) */}
          {comparisonData && !isSingleSeason && (
            <SeasonComparisonChart
              resultA={resultA}
              resultB={resultB}
              comparisonData={comparisonData}
            />
          )}

          {/* Two Driver Comparison (only when both selected) */}
          {hasBothDrivers && comparisonData && (
            <TwoDriverComparison
              resultA={resultA}
              resultB={resultB}
              comparisonData={comparisonData}
              selectedSeason={selectedSeason}
            />
          )}

          {/* Top Differences Table (hide when single season — only 1 row would show) */}
          {!isSingleSeason && (
            <TopDifferencesTable resultA={resultA} resultB={resultB} />
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasResults && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4 opacity-20">?</div>
          <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-400 mb-2">
            Select a driver to get started
          </h3>
          <p className="text-f1-silver text-sm max-w-md mx-auto">
            Choose one or two drivers and a scoring system to see how their career points would change under different rules.
          </p>
        </motion.div>
      )}
    </>
  )
}
