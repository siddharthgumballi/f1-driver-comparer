import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DriverSelect from './components/DriverSelect'
import { getDriverStats, getHeadToHead, setLiveMode } from './lib/ergast'
import type { Driver, DriverStats, HeadToHead } from './lib/ergast'
import { overlayOpenF1CurrentSeason } from './lib/openf1'

// Map of constructor IDs to their 2025 car image URLs
const CONSTRUCTOR_CARS: Record<string, string> = {
  'mercedes': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/mercedes.png',
  'red_bull': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/red-bull-racing.png',
  'ferrari': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/ferrari.png',
  'mclaren': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/mclaren.png',
  'alpine': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/alpine.png',
  'aston_martin': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/aston-martin.png',
  'alphatauri': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/rb.png',
  'racing_bulls': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/rb.png',
  'rb': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/rb.png',
  'alfa': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/kick-sauber.png',
  'sauber': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/kick-sauber.png',
  'kick_sauber': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/kick-sauber.png',
  'williams': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/williams.png',
  'haas': 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/haas-f1-team.png'
}

function numberFmt(n: number | null | undefined, digits = 0) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function StatRow({ title, a, b, invert = false }: { title: string; a?: number | null; b?: number | null; invert?: boolean }) {
  // Handle undefined values by defaulting to null
  const aValue = a ?? null;
  const bValue = b ?? null;
  const leftBetter = aValue !== null && bValue !== null ? (invert ? (aValue < bValue) : (aValue > bValue)) : false
  const rightBetter = aValue !== null && bValue !== null ? (invert ? (bValue < aValue) : (bValue > aValue)) : false
  return (
    <div className="grid grid-cols-7 items-center gap-3 py-2">
      <div className={`col-span-3 rounded-md px-3 py-1 ${leftBetter ? 'bg-red-600/20 ring-1 ring-red-600/40' : 'bg-zinc-900/50'}`}>{numberFmt(aValue, Number.isInteger(aValue) ? 0 : 2)}</div>
      <div className="col-span-1 text-center text-sm text-zinc-400">{title}</div>
      <div className={`col-span-3 rounded-md px-3 py-1 ${rightBetter ? 'bg-red-600/20 ring-1 ring-red-600/40' : 'bg-zinc-900/50'}`}>{numberFmt(bValue, Number.isInteger(bValue) ? 0 : 2)}</div>
    </div>
  )
}

function Stat({ title, value }: { title: string; value?: number | null }) {
  const displayValue = value !== null && value !== undefined 
    ? numberFmt(value, Number.isInteger(value) ? 0 : 2)
    : '—';
    
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="text-sm text-zinc-400">{displayValue}</div>
    </div>
  )
}

export default function App() {
  const [a, setA] = useState<Driver | null>(null)
  const [b, setB] = useState<Driver | null>(null)
  const [statsA, setStatsA] = useState<DriverStats | null>(null)
  const [statsB, setStatsB] = useState<DriverStats | null>(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [h2h, setH2h] = useState<HeadToHead | null>(null)
  const [live, setLive] = useState(false)
  const bothSelected = a && b

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const aId = params.get('a')
    const bId = params.get('b')
    if (aId) fetchDriver(aId, 'a')
    if (bId) fetchDriver(bId, 'b')
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (a) params.set('a', a.driverId)
    if (b) params.set('b', b.driverId)
    const qs = params.toString()
    const url = qs ? `?${qs}` : location.pathname
    window.history.replaceState(null, '', url)
  }, [a, b])

  async function fetchDriver(driverId: string, side: 'a' | 'b') {
    if (side === 'a') setLoadingA(true)
    else setLoadingB(true)
    setError(null)
    try {
      const base = await getDriverStats(driverId)
      const s = live ? await overlayOpenF1CurrentSeason(base) : base
      if (side === 'a') {
        setA(s.driver)
        setStatsA(s)
      } else {
        setB(s.driver)
        setStatsB(s)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load driver stats')
    } finally {
      if (side === 'a') setLoadingA(false)
      else setLoadingB(false)
    }
  }

  useEffect(() => {
    if (a) {
      setError(null)
      getDriverStats(a.driverId)
        .then(s => (live ? overlayOpenF1CurrentSeason(s) : s))
        .then(setStatsA)
        .catch(e => setError(String(e?.message || e)))
    } else {
      setStatsA(null)
    }
  }, [a, live])
  useEffect(() => {
    if (b) {
      setError(null)
      getDriverStats(b.driverId)
        .then(s => (live ? overlayOpenF1CurrentSeason(s) : s))
        .then(setStatsB)
        .catch(e => setError(String(e?.message || e)))
    } else {
      setStatsB(null)
    }
  }, [b, live])

  useEffect(() => {
    if (a && b) {
      getHeadToHead(a.driverId, b.driverId).then(setH2h).catch(() => setH2h(null))
    } else {
      setH2h(null)
    }
  }, [a, b])

  // Live mode: enable cache-busting in data layer and poll every 60s
  useEffect(() => {
    setLiveMode(live)
    if (!live) return
    const refetch = () => {
      if (a) getDriverStats(a.driverId).then(s => overlayOpenF1CurrentSeason(s)).then(setStatsA).catch(() => {})
      if (b) getDriverStats(b.driverId).then(s => overlayOpenF1CurrentSeason(s)).then(setStatsB).catch(() => {})
      if (a && b) getHeadToHead(a.driverId, b.driverId).then(setH2h).catch(() => {})
    }
    const id = setInterval(refetch, 60000)
    // immediate refresh when toggled on
    refetch()
    return () => clearInterval(id)
  }, [live, a?.driverId, b?.driverId, loadingA, loadingB])

  const header = useMemo(() => (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">F1 Driver Comparer</h1>
      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={live}
          onChange={e => setLive(e.target.checked)}
        />
        Live mode
      </label>
    </div>
  ), [live])

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10
      }
    }
  } as const;

  return (
    <div className="relative min-h-screen bg-black p-4 md:p-8 overflow-hidden">
      {/* F1 Track Background */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[url('https://www.formula1.com/etc/designs/fom-website/images/patterns/01-f1-circuit.svg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
      </div>
      <motion.div 
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <div>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              F1 Driver Comparer
            </motion.h1>
            <motion.p 
              className="text-zinc-400"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Compare F1 driver statistics head-to-head
            </motion.p>
          </div>

          <motion.div 
            className="flex items-center gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.label 
              className="flex items-center gap-2 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={live}
                  onChange={e => setLive(e.target.checked)}
                />
                <div className={`w-12 h-6 rounded-full shadow-inner transition-all duration-300 ${live ? 'bg-red-600' : 'bg-zinc-700'}`}></div>
                <motion.div
                  className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ x: live ? 26 : 0 }}
                ></motion.div>
              </div>
              <span className={`text-sm font-medium transition-colors ${live ? 'text-red-400' : 'text-zinc-400'}`}>
                Live Mode {live && '🔴'}
              </span>
            </motion.label>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
            key={`${a?.driverId}-${b?.driverId}`}
          >
            <motion.div className="space-y-4 bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 hover:border-blue-500/30 transition-colors" variants={item}>
              <div className="relative">
                <DriverSelect label="Driver A" value={a} onChange={setA} disabled={loadingA} />
                {loadingA && (
                  <motion.div 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                )}
              </div>
              {loadingA ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-zinc-400">Loading driver data...</p>
                  </div>
                </div>
              ) : statsA && (
                <motion.div 
                  className="w-full rounded-lg border border-blue-500/30 bg-zinc-900/80 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm hover:border-blue-500/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative mb-4">
                    <h2 className="text-2xl font-bold">
                      {statsA.driver.givenName} <span className="text-red-500">{statsA.driver.familyName}</span>
                    </h2>
                    {(() => {
                      // Get the most recent constructor (first in the sorted array)
                      const latestConstructor = [...(statsA.constructors || [])].sort((a, b) => {
                        const aLatestSeason = Math.max(...a.seasons);
                        const bLatestSeason = Math.max(...b.seasons);
                        return bLatestSeason - aLatestSeason;
                      })[0];
                      
                      return latestConstructor && CONSTRUCTOR_CARS[latestConstructor.constructorId.toLowerCase()] && (
                        <div className="absolute right-0 top-0 w-24 h-16 opacity-75 -mr-2">
                          <img 
                            src={CONSTRUCTOR_CARS[latestConstructor.constructorId.toLowerCase()]} 
                            alt={`${latestConstructor.name} car`}
                            className="w-full h-full object-contain object-right"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Stat title="Races" value={statsA.starts} />
                    <Stat title="Wins" value={statsA.wins} />
                    <Stat title="Podiums" value={statsA.podiums} />
                    <Stat title="Poles" value={statsA.poles} />
                    <Stat title="Fastest Laps" value={statsA.fastestLaps} />
                    <Stat title="Points" value={statsA.points} />
                    <Stat title="World Championships" value={statsA.championships} />
                    <Stat title="Best Finish" value={statsA.bestFinish} />
                    <Stat title="Best Grid" value={statsA.bestGrid} />
                    <Stat title="Top 10 Finishes" value={statsA.top10} />
                    <Stat title="Front Row Starts" value={statsA.frontRow} />
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div className="space-y-4 bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 hover:border-blue-500/30 transition-colors" variants={item}>
              <div className="relative">
                <DriverSelect label="Driver B" value={b} onChange={setB} disabled={loadingB} />
                {loadingB && (
                  <motion.div 
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                )}
              </div>
              {loadingB ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-zinc-400">Loading driver data...</p>
                  </div>
                </div>
              ) : statsB && (
                <motion.div 
                  className="w-full rounded-lg border border-blue-500/30 bg-zinc-900/80 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm hover:border-blue-500/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="relative mb-4">
                    <h2 className="text-2xl font-bold">
                      {statsB.driver.givenName} <span className="text-blue-400">{statsB.driver.familyName}</span>
                    </h2>
                    {(() => {
                      // Get the most recent constructor (first in the sorted array)
                      const latestConstructor = [...(statsB.constructors || [])].sort((a, b) => {
                        const aLatestSeason = Math.max(...a.seasons);
                        const bLatestSeason = Math.max(...b.seasons);
                        return bLatestSeason - aLatestSeason;
                      })[0];
                      
                      return latestConstructor && CONSTRUCTOR_CARS[latestConstructor.constructorId.toLowerCase()] && (
                        <div className="absolute right-0 top-0 w-24 h-16 opacity-75 -mr-2">
                          <img 
                            src={CONSTRUCTOR_CARS[latestConstructor.constructorId.toLowerCase()]} 
                            alt={`${latestConstructor.name} car`}
                            className="w-full h-full object-contain object-right"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Stat title="Races" value={statsB.starts} />
                    <Stat title="Wins" value={statsB.wins} />
                    <Stat title="Podiums" value={statsB.podiums} />
                    <Stat title="Poles" value={statsB.poles} />
                    <Stat title="Fastest Laps" value={statsB.fastestLaps} />
                    <Stat title="Points" value={statsB.points} />
                    <Stat title="World Championships" value={statsB.championships} />
                    <Stat title="Best Finish" value={statsB.bestFinish} />
                    <Stat title="Best Grid" value={statsB.bestGrid} />
                    <Stat title="Top 10 Finishes" value={statsB.top10} />
                    <Stat title="Front Row Starts" value={statsB.frontRow} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {bothSelected && h2h && (
          <motion.div 
            className="mt-8 bg-zinc-900/50 rounded-lg p-6 border border-zinc-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Head to Head - {h2h.racesTogether} Races
              </h2>
              <div className="group relative">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-zinc-400 hover:text-zinc-200 cursor-help transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 text-xs text-white rounded-md shadow-lg z-50 w-64 text-center">
                  Compares the two drivers' performance in races where they raced together
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-zinc-800"></div>
                </div>
              </div>
            </div>
            
            {/* Wins Comparison */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-300">Wins</span>
              </div>
              <div className="relative flex items-center h-8 bg-zinc-800/50 rounded-full overflow-visible">
                {/* Driver A Wins */}
                <div 
                  className="group h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-end pr-4 text-white font-medium text-sm transition-all duration-300 relative z-10"
                  style={{ width: `${(h2h.a.wins / Math.max(h2h.racesTogether, 1)) * 100}%` }}
                >
                  {h2h.a.wins > 0 && h2h.a.wins}
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-700 shadow-lg">
                    {a?.givenName} {a?.familyName}
                  </div>
                </div>
                
                {/* Other Drivers' Wins (Gray Section) */}
                <div 
                  className="group h-full bg-zinc-600 flex items-center justify-center text-white/80 font-medium text-xs transition-all duration-300 relative z-10"
                  style={{ width: `${(Math.max(0, h2h.racesTogether - h2h.a.wins - h2h.b.wins) / Math.max(h2h.racesTogether, 1)) * 100}%` }}
                >
                  {h2h.racesTogether - h2h.a.wins - h2h.b.wins > 0 && (
                    <>
                      <span className="group-hover:hidden">
                        {h2h.racesTogether - h2h.a.wins - h2h.b.wins}
                      </span>
                      <span className="hidden group-hover:block">
                        Other Drivers
                      </span>
                    </>
                  )}
                </div>
                
                {/* Driver B Wins */}
                <div 
                  className="group h-full bg-gradient-to-l from-blue-600 to-cyan-500 flex items-center justify-start pl-4 text-white font-medium text-sm transition-all duration-300 relative z-10"
                  style={{ width: `${(h2h.b.wins / Math.max(h2h.racesTogether, 1)) * 100}%` }}
                >
                  {h2h.b.wins > 0 && h2h.b.wins}
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-700 shadow-lg">
                    {b?.givenName} {b?.familyName}
                  </div>
                </div>
              </div>
            </div>

            {/* Head to Head Comparison */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-300">Head to Head</span>
                <span className="text-xs text-zinc-400">
                  {h2h.bothFinished} race{h2h.bothFinished !== 1 ? 's' : ''} both finished
                </span>
              </div>
              <div className="relative flex items-center h-8 bg-zinc-800/50 rounded-full overflow-visible">
                {/* Driver A Finished Ahead */}
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-end pr-4 text-white font-medium text-sm transition-all duration-300 relative z-10"
                  style={{ width: `${(h2h.a.finishedAhead / Math.max(h2h.bothFinished, 1)) * 100}%` }}
                >
                  {h2h.a.finishedAhead > 0 && h2h.a.finishedAhead}
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-700 shadow-lg">
                    {a?.givenName} finished ahead {h2h.a.finishedAhead} time{h2h.a.finishedAhead !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Equal Finishes */}
                {(h2h.bothFinished - h2h.a.finishedAhead - h2h.b.finishedAhead) > 0 && (
                  <div 
                    className="h-full bg-zinc-600 flex items-center justify-center text-white/80 font-medium text-xs transition-all duration-300 relative z-10"
                    style={{ width: `${((h2h.bothFinished - h2h.a.finishedAhead - h2h.b.finishedAhead) / Math.max(h2h.bothFinished, 1)) * 100}%` }}
                  >
                    <span className="group-hover:hidden">
                      {h2h.bothFinished - h2h.a.finishedAhead - h2h.b.finishedAhead}
                    </span>
                    <span className="hidden group-hover:block">
                      Equal Finish
                    </span>
                  </div>
                )}
                
                {/* Driver B Finished Ahead */}
                <div 
                  className="h-full bg-gradient-to-l from-blue-600 to-cyan-500 flex items-center justify-start pl-4 text-white font-medium text-sm transition-all duration-300 relative z-10"
                  style={{ width: `${(h2h.b.finishedAhead / Math.max(h2h.bothFinished, 1)) * 100}%` }}
                >
                  {h2h.b.finishedAhead > 0 && h2h.b.finishedAhead}
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-700 shadow-lg">
                    {b?.givenName} finished ahead {h2h.b.finishedAhead} time{h2h.b.finishedAhead !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Driver A Stats */}
              <div className="space-y-2">
                <div className="text-center font-medium text-red-400">
                  {a?.givenName} {a?.familyName}
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.a.wins}</div>
                  <div className="text-center text-sm text-zinc-400">Wins</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.a.points}</div>
                  <div className="text-center text-sm text-zinc-400">Points</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">
                    {h2h.a.avgFinish ? h2h.a.avgFinish.toFixed(1) : '—'}
                  </div>
                  <div className="text-center text-sm text-zinc-400">Avg. Finish</div>
                </div>
              </div>

              {/* VS Separator */}
              <div className="flex items-center justify-center">
                <div className="text-2xl font-bold text-zinc-500">VS</div>
              </div>

              {/* Driver B Stats */}
              <div className="space-y-2">
                <div className="text-center font-medium text-blue-400">
                  {b?.givenName} {b?.familyName}
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.b.wins}</div>
                  <div className="text-center text-sm text-zinc-400">Wins</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.b.points}</div>
                  <div className="text-center text-sm text-zinc-400">Points</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">
                    {h2h.b.avgFinish ? h2h.b.avgFinish.toFixed(1) : '—'}
                  </div>
                  <div className="text-center text-sm text-zinc-400">Avg. Finish</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {statsA && statsB && (
          <div className="mt-8 bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 rounded-xl p-6 border border-zinc-800/50 backdrop-blur-sm shadow-lg shadow-blue-500/5 hover:border-blue-500/30 transition-colors">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Constructor History</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-sm text-zinc-400">Constructor history (A)</div>
                <ul className="space-y-1 text-sm">
                  {[...statsA.constructors].sort((a, b) => {
                    // Sort by the latest season first
                    const aLatestSeason = Math.max(...a.seasons);
                    const bLatestSeason = Math.max(...b.seasons);
                    return bLatestSeason - aLatestSeason;
                  }).map((c, index, sortedConstructors) => (
                    <motion.div 
                      className="p-4 rounded-lg bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border border-zinc-800/50 hover:border-blue-500/30 transition-colors overflow-hidden relative"
                      variants={item}
                    >
                      {index === 0 && CONSTRUCTOR_CARS[c.constructorId.toLowerCase()] && (
                        <div className="absolute right-0 top-0 w-32 h-full opacity-75 -mr-4">
                          <img 
                            src={CONSTRUCTOR_CARS[c.constructorId.toLowerCase()]} 
                            alt={`${c.name} car`}
                            className="w-full h-full object-contain object-right"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="relative z-10">
                        <li key={`ca-${c.constructorId}`} className="rounded-md bg-zinc-900/50 px-4 py-3 border border-zinc-800/50 hover:border-blue-500/50 transition-colors">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-zinc-400">S:{c.starts} • W:{c.wins} • P:{c.podiums} • Pts:{numberFmt(c.points,1)} • Years: {c.seasons.sort((x,y)=>x-y).join(', ')}</div>
                        </li>
                      </div>
                    </motion.div>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 text-sm text-zinc-400">Constructor history (B)</div>
                <ul className="space-y-1 text-sm">
                  {[...statsB.constructors].sort((a, b) => {
                    // Sort by the latest season first
                    const aLatestSeason = Math.max(...a.seasons);
                    const bLatestSeason = Math.max(...b.seasons);
                    return bLatestSeason - aLatestSeason;
                  }).map((c, index, sortedConstructors) => (
                    <motion.div 
                      className="p-4 rounded-lg bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border border-zinc-800/50 hover:border-blue-500/30 transition-colors overflow-hidden relative"
                      variants={item}
                      key={`cb-${c.constructorId}`}
                    >
                      {index === 0 && CONSTRUCTOR_CARS[c.constructorId.toLowerCase()] && (
                        <div className="absolute right-0 top-0 w-32 h-full opacity-75 -mr-4">
                          <img 
                            src={CONSTRUCTOR_CARS[c.constructorId.toLowerCase()]} 
                            alt={`${c.name} car`}
                            className="w-full h-full object-contain object-right"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="relative z-10">
                        <div className="rounded-md bg-zinc-900/50 px-4 py-3 border border-zinc-800/50 hover:border-blue-500/50 transition-colors">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-zinc-400">S:{c.starts} • W:{c.wins} • P:{c.podiums} • Pts:{numberFmt(c.points,1)} • Years: {c.seasons.sort((x,y)=>x-y).join(', ')}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {!loadingA && !loadingB && error && <div className="mt-2 text-center text-red-400">{error}</div>}
      </motion.div>
    </div>
  )
}
