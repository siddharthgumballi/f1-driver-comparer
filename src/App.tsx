import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import DriverSelect from './components/DriverSelect'
import { getDriverStats, getHeadToHead, setLiveMode, getDriverRaceResults, getChampionshipYears } from './lib/ergast'
import { overlayOpenF1CurrentSeason } from './lib/openf1'
import type { Driver, DriverStats, HeadToHead as HeadToHeadType, RaceResult } from './types'

// Components
import { Header } from './components/layout/Header'
import { EmptyState } from './components/layout/EmptyState'
import { GlassCard, ShareButton, HistoryPanel, PrintButton, KeyboardShortcutsHelp } from './components/ui'
import { F1CarLoader } from './components/ui/F1CarLoader'
import { DriverCard, SeasonBreakdown } from './components/driver'
import { HeadToHead, ConstructorHistory } from './components/comparison'
import { CareerProgressionChart } from './components/charts'
import { RaceByRaceBreakdown } from './components/comparison/RaceByRaceBreakdown'
import { ChampionshipTimeline } from './components/comparison/ChampionshipTimeline'

// Hooks
import { useDarkMode } from './hooks/useDarkMode'
import { useUrlState } from './hooks/useUrlState'
import { useComparisonHistory } from './hooks/useComparisonHistory'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function App() {
  const [driverA, setDriverA] = useState<Driver | null>(null)
  const [driverB, setDriverB] = useState<Driver | null>(null)
  const [statsA, setStatsA] = useState<DriverStats | null>(null)
  const [statsB, setStatsB] = useState<DriverStats | null>(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [h2h, setH2h] = useState<HeadToHeadType | null>(null)
  const [live, setLive] = useState(false)
  const [racesA, setRacesA] = useState<RaceResult[]>([])
  const [racesB, setRacesB] = useState<RaceResult[]>([])
  const [champYearsA, setChampYearsA] = useState<number[]>([])
  const [champYearsB, setChampYearsB] = useState<number[]>([])

  const { darkMode, setDarkMode, toggleDarkMode } = useDarkMode()
  const {
    recentComparisons,
    favorites,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
    clearHistory,
    isFavorite,
  } = useComparisonHistory()

  // Refs for keyboard shortcuts
  const driverASelectRef = useRef<HTMLDivElement>(null)
  const driverBSelectRef = useRef<HTMLDivElement>(null)
  const h2hSectionRef = useRef<HTMLDivElement>(null)

  const fetchDriver = useCallback(async (driverId: string, side: 'a' | 'b') => {
    const setLoading = side === 'a' ? setLoadingA : setLoadingB
    const setStats = side === 'a' ? setStatsA : setStatsB
    const setDriver = side === 'a' ? setDriverA : setDriverB
    const setRaces = side === 'a' ? setRacesA : setRacesB
    const setChampYears = side === 'a' ? setChampYearsA : setChampYearsB

    setLoading(true)
    setError(null)
    try {
      const [base, races, years] = await Promise.all([
        getDriverStats(driverId),
        getDriverRaceResults(driverId),
        getChampionshipYears(driverId),
      ])
      const s = live ? await overlayOpenF1CurrentSeason(base) : base
      setDriver(s.driver as Driver)
      setStats(s as DriverStats)
      setRaces(races as RaceResult[])
      setChampYears(years)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load driver stats')
    } finally {
      setLoading(false)
    }
  }, [live])

  useUrlState({
    driverA,
    driverB,
    onLoadDriverA: (id) => fetchDriver(id, 'a'),
    onLoadDriverB: (id) => fetchDriver(id, 'b'),
  })

  // Fetch stats when driver changes
  useEffect(() => {
    if (driverA) fetchDriver(driverA.driverId, 'a')
    else {
      setStatsA(null)
      setRacesA([])
      setChampYearsA([])
    }
  }, [driverA?.driverId, live])

  useEffect(() => {
    if (driverB) fetchDriver(driverB.driverId, 'b')
    else {
      setStatsB(null)
      setRacesB([])
      setChampYearsB([])
    }
  }, [driverB?.driverId, live])

  // Head to head
  useEffect(() => {
    if (driverA && driverB) {
      getHeadToHead(driverA.driverId, driverB.driverId)
        .then((result) => setH2h(result as HeadToHeadType))
        .catch(() => setH2h(null))
    } else {
      setH2h(null)
    }
  }, [driverA?.driverId, driverB?.driverId])

  // Live mode toggle
  useEffect(() => {
    setLiveMode(live)
  }, [live])

  // Add to history when both drivers are selected
  useEffect(() => {
    if (driverA && driverB) {
      addToHistory(driverA, driverB)
    }
  }, [driverA?.driverId, driverB?.driverId, addToHistory])

  const handleSelectComparison = (a: Driver, b: Driver) => {
    setDriverA(a)
    setDriverB(b)
  }

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusDriverA: () => {
      const button = driverASelectRef.current?.querySelector('button')
      button?.click()
    },
    onFocusDriverB: () => {
      const button = driverBSelectRef.current?.querySelector('button')
      button?.click()
    },
    onToggleDarkMode: toggleDarkMode,
    onToggleLiveMode: () => setLive((prev) => !prev),
    onPrint: handlePrint,
    onScrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    onScrollToH2H: () => h2hSectionRef.current?.scrollIntoView({ behavior: 'smooth' }),
  })

  const bothSelected = driverA && driverB
  const hasStats = statsA || statsB
  const showEmptyState = !driverA && !driverB && !loadingA && !loadingB

  return (
    <>
        <div className="no-print">
          <Header
            live={live}
            onLiveChange={setLive}
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
          />
        </div>

        {/* Print Header - only visible when printing */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-black">F1 Driver Comparer</h1>
          {driverA && driverB && (
            <p className="text-sm text-gray-600 mt-1">
              {driverA.givenName} {driverA.familyName} vs {driverB.givenName} {driverB.familyName}
            </p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 mb-4 no-print relative z-[200]">
          <HistoryPanel
            recentComparisons={recentComparisons}
            favorites={favorites}
            onSelectComparison={handleSelectComparison}
            onAddToFavorites={addToFavorites}
            onRemoveFromFavorites={removeFromFavorites}
            onClearHistory={clearHistory}
            isFavorite={isFavorite}
          />
          <ShareButton driverA={driverA} driverB={driverB} />
          <PrintButton onPrint={handlePrint} />
          <KeyboardShortcutsHelp />

          {/* Favorite current comparison button */}
          {bothSelected && (
            <motion.button
              onClick={() =>
                isFavorite(driverA, driverB)
                  ? removeFromFavorites(`${[driverA.driverId, driverB.driverId].sort().join('-')}`)
                  : addToFavorites(driverA, driverB)
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                isFavorite(driverA, driverB)
                  ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                  : 'bg-f1-carbon border-f1-steel hover:border-accent-gold text-f1-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={isFavorite(driverA, driverB) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className="w-4 h-4"
                fill={isFavorite(driverA, driverB) ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              {isFavorite(driverA, driverB) ? 'Favorited' : 'Favorite'}
            </motion.button>
          )}
        </div>

        {/* Driver Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-8 relative z-[100] no-print">
          <div ref={driverASelectRef} className="relative z-[102]">
            <GlassCard variant="red" className="p-6">
              <DriverSelect label="Driver A" value={driverA} onChange={setDriverA} disabled={loadingA} />
            </GlassCard>
          </div>
          <div ref={driverBSelectRef} className="relative z-[101]">
            <GlassCard variant="cyan" className="p-6">
              <DriverSelect label="Driver B" value={driverB} onChange={setDriverB} disabled={loadingB} />
            </GlassCard>
          </div>
        </div>

        {/* Empty State */}
        {showEmptyState && <EmptyState onSelectComparison={handleSelectComparison} />}

        {/* Loading State */}
        {(loadingA || loadingB) && !hasStats && (
          <div className="flex justify-center py-16 no-print">
            <F1CarLoader variant={loadingA ? 'red' : 'cyan'} message="Loading driver data..." />
          </div>
        )}

        {/* Driver Cards */}
        {hasStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 xl:gap-8 items-start relative z-0 print-section">
            {/* Driver A Card */}
            {loadingA ? (
              <div className="h-64 flex items-center justify-center no-print">
                <F1CarLoader variant="red" />
              </div>
            ) : statsA ? (
              <DriverCard stats={statsA} accent="red" label="Driver A Summary" />
            ) : <div />}

            {/* Driver B Card */}
            {loadingB ? (
              <div className="h-64 flex items-center justify-center no-print">
                <F1CarLoader variant="cyan" />
              </div>
            ) : statsB ? (
              <DriverCard stats={statsB} accent="cyan" label="Driver B Summary" />
            ) : <div />}

            {/* Driver A Season Breakdown */}
            {!loadingA && statsA ? (
              <SeasonBreakdown seasons={statsA.seasons} accent="red" />
            ) : <div />}

            {/* Driver B Season Breakdown */}
            {!loadingB && statsB ? (
              <SeasonBreakdown seasons={statsB.seasons} accent="cyan" />
            ) : <div />}
          </div>
        )}

        {/* Head to Head */}
        {bothSelected && h2h && h2h.racesTogether > 0 && (
          <div className="mt-8 print-page" ref={h2hSectionRef} id="head-to-head">
            <HeadToHead h2h={h2h} driverA={driverA} driverB={driverB} />
          </div>
        )}

        {/* Career Progression Chart */}
        {statsA && statsB && (
          <div className="mt-8 print-page">
            <CareerProgressionChart
              statsA={statsA}
              statsB={statsB}
              driverA={driverA!}
              driverB={driverB!}
            />
          </div>
        )}

        {/* Championship Timeline */}
        {statsA && statsB && (champYearsA.length > 0 || champYearsB.length > 0) && (
          <div className="mt-8 print-page">
            <ChampionshipTimeline
              statsA={statsA}
              statsB={statsB}
              driverA={driverA!}
              driverB={driverB!}
              championshipYearsA={champYearsA}
              championshipYearsB={champYearsB}
            />
          </div>
        )}

        {/* Race by Race Breakdown */}
        {racesA.length > 0 && racesB.length > 0 && driverA && driverB && (
          <div className="mt-8 print-page">
            <RaceByRaceBreakdown
              racesA={racesA}
              racesB={racesB}
              driverA={driverA}
              driverB={driverB}
            />
          </div>
        )}

        {/* Constructor History */}
        {statsA && statsB && (
          <div className="mt-8 print-page">
            <ConstructorHistory
              statsA={statsA}
              statsB={statsB}
              driverA={driverA!}
              driverB={driverB!}
            />
          </div>
        )}

        {/* Error Display */}
        {!loadingA && !loadingB && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 rounded-xl bg-f1-red/10 border border-f1-red/30 text-center no-print"
          >
            <p className="text-f1-red font-medium">{error}</p>
            <button
              onClick={() => {
                setError(null)
                if (driverA) fetchDriver(driverA.driverId, 'a')
                if (driverB) fetchDriver(driverB.driverId, 'b')
              }}
              className="mt-2 px-4 py-1.5 text-sm bg-f1-red text-white rounded-lg hover:bg-f1-darkRed transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block print-footer">
          F1 Driver Comparer &middot; Generated {new Date().toLocaleDateString()} &middot; Data from Ergast F1 API
        </div>
    </>
  )
}
