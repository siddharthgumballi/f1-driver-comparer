import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import DriverSelect from './components/DriverSelect'
import { getDriverStats, getHeadToHead, setLiveMode, getDriverRaceResults, getChampionshipYears } from './lib/ergast'
import { overlayOpenF1CurrentSeason } from './lib/openf1'
import type { Driver, DriverStats, HeadToHead as HeadToHeadType, RaceResult } from './types'

// Components
import { Header } from './components/layout/Header'
import { EmptyState } from './components/layout/EmptyState'
import { GlassCard } from './components/ui/GlassCard'
import { F1CarLoader } from './components/ui/F1CarLoader'
import { DriverCard, SeasonBreakdown } from './components/driver'
import { HeadToHead, ConstructorHistory } from './components/comparison'
import { CareerProgressionChart } from './components/charts'
import { RaceByRaceBreakdown } from './components/comparison/RaceByRaceBreakdown'
import { ChampionshipTimeline } from './components/comparison/ChampionshipTimeline'

// Hooks
import { useDarkMode } from './hooks/useDarkMode'
import { useUrlState } from './hooks/useUrlState'

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

  const { darkMode, setDarkMode } = useDarkMode()

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

  const handleSelectComparison = (a: Driver, b: Driver) => {
    setDriverA(a)
    setDriverB(b)
  }

  const bothSelected = driverA && driverB
  const hasStats = statsA || statsB
  const showEmptyState = !driverA && !driverB && !loadingA && !loadingB

  return (
    <div className="relative min-h-screen bg-white dark:bg-f1-black text-zinc-900 dark:text-f1-white p-4 md:p-8 overflow-hidden">
      {/* F1 Track Background */}
      <div className="absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('https://www.formula1.com/etc/designs/fom-website/images/patterns/01-f1-circuit.svg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-white/90 dark:from-f1-black/90 dark:to-f1-black/90" />
      </div>

      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header
          live={live}
          onLiveChange={setLive}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
        />

        {/* Driver Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-50">
          <GlassCard variant="red" className="p-6 relative z-50">
            <DriverSelect label="Driver A" value={driverA} onChange={setDriverA} disabled={loadingA} />
          </GlassCard>
          <GlassCard variant="cyan" className="p-6 relative z-50">
            <DriverSelect label="Driver B" value={driverB} onChange={setDriverB} disabled={loadingB} />
          </GlassCard>
        </div>

        {/* Empty State */}
        {showEmptyState && <EmptyState onSelectComparison={handleSelectComparison} />}

        {/* Loading State */}
        {(loadingA || loadingB) && !hasStats && (
          <div className="flex justify-center py-16">
            <F1CarLoader variant={loadingA ? 'red' : 'cyan'} message="Loading driver data..." />
          </div>
        )}

        {/* Driver Cards */}
        {hasStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Driver A Column */}
            <div className="space-y-4">
              {loadingA ? (
                <div className="h-64 flex items-center justify-center">
                  <F1CarLoader variant="red" />
                </div>
              ) : statsA ? (
                <>
                  <DriverCard stats={statsA} accent="red" label="Driver A Summary" />
                  <SeasonBreakdown seasons={statsA.seasons} accent="red" />
                </>
              ) : null}
            </div>

            {/* Driver B Column */}
            <div className="space-y-4">
              {loadingB ? (
                <div className="h-64 flex items-center justify-center">
                  <F1CarLoader variant="cyan" />
                </div>
              ) : statsB ? (
                <>
                  <DriverCard stats={statsB} accent="cyan" label="Driver B Summary" />
                  <SeasonBreakdown seasons={statsB.seasons} accent="cyan" />
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Head to Head */}
        {bothSelected && h2h && h2h.racesTogether > 0 && (
          <div className="mt-8">
            <HeadToHead h2h={h2h} driverA={driverA} driverB={driverB} />
          </div>
        )}

        {/* Career Progression Chart */}
        {statsA && statsB && (
          <div className="mt-8">
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
          <div className="mt-8">
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
          <div className="mt-8">
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
          <div className="mt-8">
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
            className="mt-8 p-4 rounded-xl bg-f1-red/10 border border-f1-red/30 text-center"
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
      </motion.div>
    </div>
  )
}
