import { motion } from 'framer-motion'
import DriverSelect from '../components/DriverSelect'
import { GlassCard } from '../components/ui/GlassCard'
import { F1CarLoader } from '../components/ui/F1CarLoader'
import { useDarkMode } from '../hooks/useDarkMode'
import { usePointsNormalizer } from '../hooks/usePointsNormalizer'
import {
  WhatIfHeader,
  ScoringSystemSelector,
  DriverSummaryCards,
  SeasonComparisonChart,
  TopDifferencesTable,
  TwoDriverComparison,
  SeasonPicker,
} from '../components/what-if'

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
        <GlassCard variant="red" className="p-6 relative z-[100]">
          <DriverSelect
            label="Driver A (optional)"
            value={driverA}
            onChange={setDriverA}
            disabled={loadingA}
          />
        </GlassCard>

        <GlassCard variant="cyan" className="p-6 relative z-[100]">
          <DriverSelect
            label="Driver B (optional)"
            value={driverB}
            onChange={setDriverB}
            disabled={loadingB}
          />
        </GlassCard>

        <ScoringSystemSelector
          selectedSystem={selectedSystem}
          onSelect={setSelectedSystem}
        />
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
