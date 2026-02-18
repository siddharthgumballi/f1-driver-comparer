import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Driver, RaceResult } from '../types'
import { getDriverRaceResults, getDriverById } from '../lib/ergast'
import {
  SCORING_SYSTEMS,
  getSystemById,
  normalizeDriver,
  type ScoringSystem,
  type NormalizerResult,
} from '../lib/pointsSystems'

export type ComparisonData = {
  // For charts: merged season data
  chartData: Array<{
    season: string
    actualA?: number
    recalcA?: number
    actualB?: number
    recalcB?: number
  }>
  // Which driver benefits more
  benefitAnalysis: {
    benefitsMore: 'A' | 'B' | 'tie'
    deltaA: number
    deltaB: number
    magnitude: number
  } | null
}

const DEFAULT_SYSTEM = SCORING_SYSTEMS[6] // 2025-present

function filterResultBySeason(
  result: NormalizerResult,
  season: string
): NormalizerResult {
  const filtered = result.seasons.filter((s) => s.season === season)
  const actualTotal = Number(filtered.reduce((s, ss) => s + ss.actualTotal, 0).toFixed(1))
  const recalcTotal = Number(filtered.reduce((s, ss) => s + ss.recalculatedTotal, 0).toFixed(1))
  return {
    ...result,
    seasons: filtered,
    careerActualTotal: actualTotal,
    careerRecalculatedTotal: recalcTotal,
    careerDelta: Number((recalcTotal - actualTotal).toFixed(1)),
  }
}

export function usePointsNormalizer() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [driverA, setDriverA] = useState<Driver | null>(null)
  const [driverB, setDriverB] = useState<Driver | null>(null)
  const [selectedSystem, setSelectedSystem] = useState<ScoringSystem>(DEFAULT_SYSTEM)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null) // null = all seasons
  const [racesA, setRacesA] = useState<RaceResult[]>([])
  const [racesB, setRacesB] = useState<RaceResult[]>([])
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Load from URL on mount
  useEffect(() => {
    const aId = searchParams.get('a')
    const bId = searchParams.get('b')
    const sysId = searchParams.get('system')
    const year = searchParams.get('year')

    if (sysId) {
      const sys = getSystemById(sysId)
      if (sys) setSelectedSystem(sys)
    }
    if (year) setSelectedSeason(year)

    const loadDrivers = async () => {
      if (aId) {
        const driver = await getDriverById(aId)
        if (driver) setDriverA(driver)
      }
      if (bId) {
        const driver = await getDriverById(bId)
        if (driver) setDriverB(driver)
      }
      setInitialized(true)
    }

    loadDrivers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state to URL
  useEffect(() => {
    if (!initialized) return

    const params: Record<string, string> = {}
    if (driverA) params.a = driverA.driverId
    if (driverB) params.b = driverB.driverId
    if (selectedSystem.id !== DEFAULT_SYSTEM.id) params.system = selectedSystem.id
    if (selectedSeason) params.year = selectedSeason

    setSearchParams(params, { replace: true })
  }, [driverA?.driverId, driverB?.driverId, selectedSystem.id, selectedSeason, initialized, setSearchParams])

  // Fetch races for driver A
  useEffect(() => {
    if (!driverA) {
      setRacesA([])
      return
    }
    let cancelled = false
    setLoadingA(true)
    setError(null)
    getDriverRaceResults(driverA.driverId)
      .then((races) => {
        if (!cancelled) setRacesA(races as RaceResult[])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load driver data')
      })
      .finally(() => {
        if (!cancelled) setLoadingA(false)
      })
    return () => { cancelled = true }
  }, [driverA?.driverId])

  // Fetch races for driver B
  useEffect(() => {
    if (!driverB) {
      setRacesB([])
      return
    }
    let cancelled = false
    setLoadingB(true)
    setError(null)
    getDriverRaceResults(driverB.driverId)
      .then((races) => {
        if (!cancelled) setRacesB(races as RaceResult[])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load driver data')
      })
      .finally(() => {
        if (!cancelled) setLoadingB(false)
      })
    return () => { cancelled = true }
  }, [driverB?.driverId])

  // Full career recalculation (always computed)
  const fullResultA: NormalizerResult | null = useMemo(() => {
    if (!driverA || racesA.length === 0) return null
    return normalizeDriver(
      driverA.driverId,
      `${driverA.givenName} ${driverA.familyName}`,
      racesA,
      selectedSystem
    )
  }, [driverA, racesA, selectedSystem])

  const fullResultB: NormalizerResult | null = useMemo(() => {
    if (!driverB || racesB.length === 0) return null
    return normalizeDriver(
      driverB.driverId,
      `${driverB.givenName} ${driverB.familyName}`,
      racesB,
      selectedSystem
    )
  }, [driverB, racesB, selectedSystem])

  // Available seasons (union of both drivers' seasons)
  const availableSeasons: string[] = useMemo(() => {
    const seasons = new Set<string>()
    fullResultA?.seasons.forEach((s) => seasons.add(s.season))
    fullResultB?.seasons.forEach((s) => seasons.add(s.season))
    return Array.from(seasons).sort()
  }, [fullResultA, fullResultB])

  // Filtered results (when a specific season is selected)
  const resultA: NormalizerResult | null = useMemo(() => {
    if (!fullResultA) return null
    if (!selectedSeason) return fullResultA
    return filterResultBySeason(fullResultA, selectedSeason)
  }, [fullResultA, selectedSeason])

  const resultB: NormalizerResult | null = useMemo(() => {
    if (!fullResultB) return null
    if (!selectedSeason) return fullResultB
    return filterResultBySeason(fullResultB, selectedSeason)
  }, [fullResultB, selectedSeason])

  // Build comparison data for charts
  const comparisonData: ComparisonData | null = useMemo(() => {
    if (!resultA && !resultB) return null

    // Merge seasons from both drivers
    const allSeasons = new Set<string>()
    resultA?.seasons.forEach((s) => allSeasons.add(s.season))
    resultB?.seasons.forEach((s) => allSeasons.add(s.season))

    const aMap = new Map(resultA?.seasons.map((s) => [s.season, s]) ?? [])
    const bMap = new Map(resultB?.seasons.map((s) => [s.season, s]) ?? [])

    const chartData = Array.from(allSeasons)
      .sort()
      .map((season) => {
        const a = aMap.get(season)
        const b = bMap.get(season)
        return {
          season,
          actualA: a?.actualTotal,
          recalcA: a?.recalculatedTotal,
          actualB: b?.actualTotal,
          recalcB: b?.recalculatedTotal,
        }
      })

    let benefitAnalysis: ComparisonData['benefitAnalysis'] = null
    if (resultA && resultB) {
      const deltaA = resultA.careerDelta
      const deltaB = resultB.careerDelta
      const magnitude = Math.abs(deltaA - deltaB)
      benefitAnalysis = {
        benefitsMore: deltaA > deltaB ? 'A' : deltaB > deltaA ? 'B' : 'tie',
        deltaA,
        deltaB,
        magnitude: Number(magnitude.toFixed(1)),
      }
    }

    return { chartData, benefitAnalysis }
  }, [resultA, resultB])

  const handleSetDriverA = useCallback((d: Driver | null) => {
    setDriverA(d)
    setError(null)
  }, [])

  const handleSetDriverB = useCallback((d: Driver | null) => {
    setDriverB(d)
    setError(null)
  }, [])

  const handleSetSystem = useCallback((s: ScoringSystem) => {
    setSelectedSystem(s)
  }, [])

  const handleSetSeason = useCallback((s: string | null) => {
    setSelectedSeason(s)
  }, [])

  return {
    driverA,
    driverB,
    setDriverA: handleSetDriverA,
    setDriverB: handleSetDriverB,
    selectedSystem,
    setSelectedSystem: handleSetSystem,
    selectedSeason,
    setSelectedSeason: handleSetSeason,
    availableSeasons,
    resultA,
    resultB,
    loadingA,
    loadingB,
    error,
    comparisonData,
  }
}
