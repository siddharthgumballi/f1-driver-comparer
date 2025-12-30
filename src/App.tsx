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

const CURRENT_SEASON = 2025

function constructorSlugFromName(name: string) {
  const n = name.trim().toLowerCase()
  if (n === 'red bull') return 'red-bull-racing'
  if (n === 'alfa romeo') return 'alfa-romeo'
  if (n === 'toro rosso') return 'toro-rosso'
  if (n === 'force india') return 'force-india'
  if (n === 'racing point') return 'racing-point'
  if (n === 'alphatauri') return 'alphatauri'
  if (n === 'rb') return 'rb'
  if (n === 'kick sauber') return 'kick-sauber'
  if (n === 'sauber') return 'sauber'
  if (n === 'bmw sauber') return 'bmw-sauber'
  if (n === 'aston martin') return 'aston-martin'
  return n
    .replace(/&/g, 'and')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function getConstructorCarUrl(year: number, constructorId: string, constructorName: string) {
  const id = constructorId.toLowerCase()
  if (year >= CURRENT_SEASON && CONSTRUCTOR_CARS[id]) return CONSTRUCTOR_CARS[id]

  const slugById: Record<string, string> = {
    'red_bull': 'red-bull-racing',
    'alfa': year >= 2024 ? 'kick-sauber' : 'alfa-romeo',  // Changed to kick-sauber for 2024
    'kick_sauber': 'kick-sauber',
    'sauber': 'sauber',
    'alphatauri': year >= 2024 ? 'rb' : 'alphatauri',
    'racing_bulls': 'rb',
    'rb': 'rb',
    'toro_rosso': 'toro-rosso',
  }

  // Try multiple approaches to find the right slug
  let slug = slugById[id]
  
  // If not found by ID, try by name
  if (!slug) {
    slug = constructorSlugFromName(constructorName)
  }
  
  // Special case for 2024 - prioritize kick-sauber if name contains sauber or alfa
  if (year === 2024) {
    if (constructorName.toLowerCase().includes('kick') || 
        constructorName.toLowerCase().includes('sauber') || 
        constructorName.toLowerCase().includes('alfa')) {
      slug = 'kick-sauber'
    }
  }

  const url = `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/${year}/${slug}.png`
  console.log('Car URL:', { year, constructorId, constructorName, slug, url })
  return url
}

function getDriverCarImage(stats: DriverStats | null, year?: number) {
  if (!stats) return null
  const targetYear = year || stats.activeYears?.to
  if (!targetYear || !stats.constructors?.length) return null

  const pick = [...stats.constructors]
    .map(c => ({ c, latest: Math.max(...c.seasons) }))
    .sort((x, y) => y.latest - x.latest)[0]
  if (!pick) return null

  const constructor = pick.c
  return {
    src: getConstructorCarUrl(targetYear, constructor.constructorId, constructor.name),
    alt: `${constructor.name} ${targetYear} car`,
  }
}

function splitConstructorStints(constructors: any[], seasonStats: any[] = []) {
  const stints: any[] = []
  
  constructors.forEach(constructor => {
    const seasons = [...constructor.seasons].sort((a, b) => a - b)
    
    // Split seasons into continuous stints
    let currentStint = [seasons[0]]
    
    for (let i = 1; i < seasons.length; i++) {
      if (seasons[i] === seasons[i - 1] + 1) {
        // Continuous season
        currentStint.push(seasons[i])
      } else {
        // Gap found, save current stint and start new one
        const stintStats = calculateStintStats(currentStint, seasonStats)
        stints.push({
          ...constructor,
          seasons: currentStint,
          stintId: `${constructor.constructorId}-${currentStint[0]}`,
          ...stintStats
        })
        currentStint = [seasons[i]]
      }
    }
    
    // Add the last stint
    if (currentStint.length > 0) {
      const stintStats = calculateStintStats(currentStint, seasonStats)
      stints.push({
        ...constructor,
        seasons: currentStint,
        stintId: `${constructor.constructorId}-${currentStint[0]}`,
        ...stintStats
      })
    }
  })
  
  return stints.sort((a, b) => Math.max(...b.seasons) - Math.max(...a.seasons))
}

function calculateStintStats(stintSeasons: number[], seasonStats: any[]) {
  const relevantStats = seasonStats.filter(stat => stintSeasons.includes(stat.season))
  
  return {
    starts: relevantStats.reduce((sum, stat) => sum + stat.starts, 0),
    wins: relevantStats.reduce((sum, stat) => sum + stat.wins, 0),
    podiums: relevantStats.reduce((sum, stat) => sum + stat.podiums, 0),
    points: relevantStats.reduce((sum, stat) => sum + stat.points, 0),
    poles: relevantStats.reduce((sum, stat) => sum + stat.poles, 0),
    fastestLaps: relevantStats.reduce((sum, stat) => sum + stat.fastestLaps, 0),
  }
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
      <div className={`col-span-3 rounded-md px-3 py-1 ${leftBetter ? 'bg-red-600/20 ring-1 ring-red-600/40' : 'bg-zinc-200/50 dark:bg-zinc-900/50'}`}>{numberFmt(aValue, Number.isInteger(aValue) ? 0 : 2)}</div>
      <div className="col-span-1 text-center text-sm text-zinc-600 dark:text-zinc-400">{title}</div>
      <div className={`col-span-3 rounded-md px-3 py-1 ${rightBetter ? 'bg-red-600/20 ring-1 ring-red-600/40' : 'bg-zinc-200/50 dark:bg-zinc-900/50'}`}>{numberFmt(bValue, Number.isInteger(bValue) ? 0 : 2)}</div>
    </div>
  )
}

function Stat({ title, value }: { title: string; value?: number | null }) {
  const displayValue = value !== null && value !== undefined 
    ? numberFmt(value, Number.isInteger(value) ? 0 : 2)
    : '—';
    
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">{title}</div>
      <div className="text-sm text-zinc-800 dark:text-zinc-400">{displayValue}</div>
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
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      if (saved !== null) return saved === 'true'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true
  })
  const bothSelected = a && b

  useEffect(() => {
    // Save dark mode preference and apply to document
    localStorage.setItem('darkMode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
      setLoadingA(true)
      getDriverStats(a.driverId)
        .then(s => (live ? overlayOpenF1CurrentSeason(s) : s))
        .then(setStatsA)
        .catch(e => setError(String(e?.message || e)))
        .finally(() => setLoadingA(false))
    } else {
      setStatsA(null)
      setLoadingA(false)
    }
  }, [a, live])
  useEffect(() => {
    if (b) {
      setError(null)
      setLoadingB(true)
      getDriverStats(b.driverId)
        .then(s => (live ? overlayOpenF1CurrentSeason(s) : s))
        .then(setStatsB)
        .catch(e => setError(String(e?.message || e)))
        .finally(() => setLoadingB(false))
    } else {
      setStatsB(null)
      setLoadingB(false)
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
    <div className="relative min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white p-4 md:p-8 overflow-hidden">
      {/* F1 Track Background */}
      <div className="absolute inset-0 -z-10 opacity-[0.06] dark:opacity-5">
        <div className="absolute inset-0 bg-[url('https://www.formula1.com/etc/designs/fom-website/images/patterns/01-f1-circuit.svg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-transparent to-white/85 dark:from-black/80 dark:to-black/80"></div>
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
              className="text-zinc-600 dark:text-zinc-400"
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
                <div className={`w-12 h-6 rounded-full shadow-inner transition-all duration-300 ${live ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                <motion.div
                  className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ x: live ? 26 : 0 }}
                ></motion.div>
              </div>
              <span className={`text-sm font-medium transition-colors ${live ? 'text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                Live Mode {live && '🔴'}
              </span>
            </motion.label>

            <motion.label
              className="flex items-center gap-2 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={darkMode}
                  onChange={e => setDarkMode(e.target.checked)}
                />
                <div className={`w-12 h-6 rounded-full shadow-inner transition-all duration-300 ${darkMode ? 'bg-zinc-700' : 'bg-yellow-400/80'}`}></div>
                <motion.div
                  className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ x: darkMode ? 26 : 0 }}
                ></motion.div>
              </div>
              <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-700'}`}>
                {darkMode ? 'Dark' : 'Light'} Mode
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
            <motion.div className="space-y-4 bg-white/70 dark:bg-black p-6 rounded-xl border border-zinc-200/70 dark:border-zinc-800/50 hover:border-blue-500/30 transition-colors backdrop-blur-sm" variants={item}>
              <div className="relative">
                <DriverSelect label="Driver A" value={a} onChange={setA} disabled={loadingA} />
              </div>
              {loadingA ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading driver data...</p>
                  </div>
                </div>
              ) : statsA && (
                <motion.div 
                  className="w-full rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/95 dark:bg-zinc-950/80 px-5 py-4 text-zinc-900 dark:text-white shadow-sm transition-colors duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                        <span className="text-zinc-900 dark:text-zinc-50">{statsA.driver.givenName}</span>{' '}
                        <span className="text-red-500">{statsA.driver.familyName}</span>
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                        Driver A Summary
                      </p>
                    </div>
                    {(() => {
                      const car = getDriverCarImage(statsA)
                      return car?.src && (
                        <div className="shrink-0 -mr-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/80 px-2 py-1">
                          <img 
                            src={car.src} 
                            alt={car.alt}
                            className="h-14 w-24 object-contain object-right"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60">
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300 w-1/2">Races</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.starts)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Wins</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.wins)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Podiums</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.podiums)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Poles</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.poles)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Fastest Laps</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.fastestLaps)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Points</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.points, 1)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">World Championships</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.championships)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Best Finish</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{statsA.bestFinish ? statsA.bestFinish : '—'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Best Grid</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{statsA.bestGrid ? statsA.bestGrid : '—'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Top 10 Finishes</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.top10)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Front Row Starts</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsA.frontRow)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div className="space-y-4 bg-white/70 dark:bg-black p-6 rounded-xl border border-zinc-200/70 dark:border-zinc-800/50 hover:border-blue-500/30 transition-colors backdrop-blur-sm" variants={item}>
              <div className="relative">
                <DriverSelect label="Driver B" value={b} onChange={setB} disabled={loadingB} />
              </div>
              {loadingB ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading driver data...</p>
                  </div>
                </div>
              ) : statsB && (
                <motion.div 
                  className="w-full rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/95 dark:bg-zinc-950/80 px-5 py-4 text-zinc-900 dark:text-white shadow-sm transition-colors duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="relative mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold leading-tight tracking-tight">
                        <span className="text-zinc-900 dark:text-zinc-50">{statsB.driver.givenName}</span>{' '}
                        <span className="text-blue-400">{statsB.driver.familyName}</span>
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
                        Driver B Summary
                      </p>
                    </div>
                    {(() => {
                      const car = getDriverCarImage(statsB)
                      return car?.src && (
                        <div className="shrink-0 -mr-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/80 px-2 py-1">
                          <img 
                            src={car.src} 
                            alt={car.alt}
                            className="h-14 w-24 object-contain object-right"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-700/60">
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300 w-1/2">Races</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.starts)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Wins</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.wins)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Podiums</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.podiums)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Poles</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.poles)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Fastest Laps</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.fastestLaps)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Points</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.points, 1)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">World Championships</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.championships)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Best Finish</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{statsB.bestFinish ? statsB.bestFinish : '—'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Best Grid</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{statsB.bestGrid ? statsB.bestGrid : '—'}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Top 10 Finishes</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.top10)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Front Row Starts</td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">{numberFmt(statsB.frontRow)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {bothSelected && h2h && (
          <motion.div 
            className="mt-8 bg-white/80 dark:bg-black rounded-lg p-6 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm"
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
                  className="h-5 w-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-help transition-colors" 
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
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 dark:bg-zinc-800 text-xs text-white rounded-md shadow-lg z-50 w-64 text-center border border-zinc-200 dark:border-zinc-700">
                  Compares the two drivers' performance in races where they raced together
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
                </div>
              </div>
            </div>
            
            {/* Wins Comparison */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Wins</span>
              </div>
              <div className="relative flex items-center h-8 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full overflow-visible">
                {/* Driver A Wins */}
                <div 
                  className="group h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-end pr-4 text-white font-medium text-sm transition-all duration-300 relative z-10"
                  style={{ width: `${(h2h.a.wins / Math.max(h2h.racesTogether, 1)) * 100}%` }}
                >
                  {h2h.a.wins > 0 && h2h.a.wins}
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-200 dark:border-zinc-700 shadow-lg">
                    {a?.givenName} {a?.familyName}
                  </div>
                </div>
                
                {/* Other Drivers' Wins (Gray Section) */}
                <div 
                  className="group h-full bg-zinc-400 dark:bg-zinc-600 flex items-center justify-center text-white/80 font-medium text-xs transition-all duration-300 relative z-10"
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
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-200 dark:border-zinc-700 shadow-lg">
                    {b?.givenName} {b?.familyName}
                  </div>
                </div>
              </div>
            </div>

            {/* Head to Head Comparison */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Head to Head</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {h2h.bothFinished} race{h2h.bothFinished !== 1 ? 's' : ''} both finished
                </span>
              </div>
              <div className="relative flex items-center h-8 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full overflow-visible">
                {/* Driver A Finished Ahead */}
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-end pr-4 text-white font-medium text-sm transition-all duration-300 relative z-10"
                  style={{ width: `${(h2h.a.finishedAhead / Math.max(h2h.bothFinished, 1)) * 100}%` }}
                >
                  {h2h.a.finishedAhead > 0 && h2h.a.finishedAhead}
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-200 dark:border-zinc-700 shadow-lg">
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
                  <div className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 border border-zinc-200 dark:border-zinc-700 shadow-lg">
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
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.a.wins}</div>
                  <div className="text-center text-sm text-zinc-400">Wins</div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.a.points}</div>
                  <div className="text-center text-sm text-zinc-400">Points</div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">
                    {h2h.a.avgFinish ? h2h.a.avgFinish.toFixed(1) : '—'}
                  </div>
                  <div className="text-center text-sm text-zinc-400">Avg. Finish</div>
                </div>
              </div>

              {/* VS Separator */}
              <div className="flex items-center justify-center">
                <div className="text-2xl font-bold text-zinc-600 dark:text-zinc-500">VS</div>
              </div>

              {/* Driver B Stats */}
              <div className="space-y-2">
                <div className="text-center font-medium text-blue-400">
                  {b?.givenName} {b?.familyName}
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.b.wins}</div>
                  <div className="text-center text-sm text-zinc-400">Wins</div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-center text-2xl font-bold">{h2h.b.points}</div>
                  <div className="text-center text-sm text-zinc-400">Points</div>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
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
          <div className="mt-8 bg-white/80 dark:bg-black rounded-xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-lg shadow-blue-500/5 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Constructor History</h2>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Teams they drove for (by season)</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-red-400">
                    {a?.givenName} {a?.familyName}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-500">Most recent first</div>
                </div>
                <div className="space-y-3">
                  {splitConstructorStints(statsA.constructors, statsA.seasons || []).map((stint, index) => {
                    const seasonsSorted = [...stint.seasons].sort((x, y) => x - y)
                    const from = seasonsSorted[0]
                    const to = seasonsSorted[seasonsSorted.length - 1]
                    const yearsLabel = from === to ? `${from}` : `${from}–${to}`
                    // Use the driver's most recent year for the car image, not the stint's first year
                    const carSrc = getConstructorCarUrl(statsA.activeYears?.to || to, stint.constructorId, stint.name)
                    
                    return (
                      <motion.div
                        key={stint.stintId}
                        className="group relative overflow-hidden rounded-xl border border-zinc-300/60 dark:border-zinc-800/60 bg-white dark:bg-black p-4 shadow-sm hover:border-red-500/30 transition-colors"
                        variants={item}
                      >
                        {index === 0 && carSrc && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 opacity-60 group-hover:opacity-80 transition-opacity">
                            <img
                              src={carSrc}
                              alt={`${stint.name} ${statsA.activeYears?.to || to} car`}
                              className="h-full w-full object-contain object-right"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/70 dark:to-black/70" />
                          </div>
                        )}

                        <div className="relative z-10 pr-10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{stint.name}</div>
                              <div className="mt-1 inline-flex items-center rounded-full bg-red-600/15 px-2 py-0.5 text-xs font-medium text-red-300 ring-1 ring-red-600/25">
                                {yearsLabel}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Starts: {stint.starts}</div>
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Wins: {stint.wins}</div>
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Podiums: {stint.podiums}</div>
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Points: {numberFmt(stint.points, 1)}</div>
                          </div>

                          <div className="text-sm text-zinc-600 dark:text-zinc-500">Seasons: {seasonsSorted.join(', ')}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-blue-400">
                    {b?.givenName} {b?.familyName}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-500">Most recent first</div>
                </div>
                <div className="space-y-3">
                  {splitConstructorStints(statsB.constructors, statsB.seasons || []).map((stint, index) => {
                    const seasonsSorted = [...stint.seasons].sort((x, y) => x - y)
                    const from = seasonsSorted[0]
                    const to = seasonsSorted[seasonsSorted.length - 1]
                    const yearsLabel = from === to ? `${from}` : `${from}–${to}`
                    // Use the driver's most recent year for the car image, not the stint's first year
                    const carSrc = getConstructorCarUrl(statsB.activeYears?.to || to, stint.constructorId, stint.name)
                    
                    return (
                      <motion.div
                        key={stint.stintId}
                        className="group relative overflow-hidden rounded-xl border border-zinc-300/60 dark:border-zinc-800/60 bg-white dark:bg-black p-4 shadow-sm hover:border-blue-500/30 transition-colors"
                        variants={item}
                      >
                        {index === 0 && carSrc && (
                          <div className="pointer-events-none absolute inset-y-0 right-0 w-40 opacity-60 group-hover:opacity-80 transition-opacity">
                            <img
                              src={carSrc}
                              alt={`${stint.name} ${statsB.activeYears?.to || to} car`}
                              className="h-full w-full object-contain object-right"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/70 dark:to-black/70" />
                          </div>
                        )}

                        <div className="relative z-10 pr-10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{stint.name}</div>
                              <div className="mt-1 inline-flex items-center rounded-full bg-blue-600/15 px-2 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-blue-600/25">
                                {yearsLabel}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Starts: {stint.starts}</div>
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Wins: {stint.wins}</div>
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Podiums: {stint.podiums}</div>
                            <div className="rounded-full bg-zinc-200/60 dark:bg-zinc-900/60 px-2 py-1 text-zinc-800 dark:text-zinc-200 ring-1 ring-zinc-300/60 dark:ring-zinc-800/60">Points: {numberFmt(stint.points, 1)}</div>
                          </div>

                          <div className="text-sm text-zinc-600 dark:text-zinc-500">Seasons: {seasonsSorted.join(', ')}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loadingA && !loadingB && error && <div className="mt-2 text-center text-red-400">{error}</div>}
      </motion.div>
    </div>
  )
}
