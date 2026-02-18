import type { RaceResult } from '../types'

// ── Types ──────────────────────────────────────────────────

export type ScoringSystem = {
  id: string
  name: string
  shortName: string
  era: string
  description: string
  points: number[]
  fastestLapBonus: number
  fastestLapRequiresTopN: number | null // null = no restriction
}

export type NormalizedRaceResult = {
  season: string
  round: number
  raceName: string
  position: number | null
  grid: number
  status: string
  actualPoints: number
  recalculatedPoints: number
  delta: number
  fastestLapBonusApplied: boolean
  constructorId?: string
  constructorName?: string
}

export type SeasonSummary = {
  season: string
  actualTotal: number
  recalculatedTotal: number
  delta: number
  races: NormalizedRaceResult[]
  raceCount: number
}

export type NormalizerResult = {
  driverId: string
  driverName: string
  system: ScoringSystem
  seasons: SeasonSummary[]
  careerActualTotal: number
  careerRecalculatedTotal: number
  careerDelta: number
}

// ── Preset Scoring Systems ─────────────────────────────────

export const SCORING_SYSTEMS: ScoringSystem[] = [
  {
    id: '1950-1960',
    name: '1950–1960',
    shortName: '50s',
    era: '1950–1960',
    description: '8-6-4-3-2 + 1pt fastest lap',
    points: [8, 6, 4, 3, 2],
    fastestLapBonus: 1,
    fastestLapRequiresTopN: null,
  },
  {
    id: '1961-1990',
    name: '1961–1990',
    shortName: '61–90',
    era: '1961–1990',
    description: '9-6-4-3-2-1',
    points: [9, 6, 4, 3, 2, 1],
    fastestLapBonus: 0,
    fastestLapRequiresTopN: null,
  },
  {
    id: '1991-2002',
    name: '1991–2002',
    shortName: '91–02',
    era: '1991–2002',
    description: '10-6-4-3-2-1',
    points: [10, 6, 4, 3, 2, 1],
    fastestLapBonus: 0,
    fastestLapRequiresTopN: null,
  },
  {
    id: '2003-2009',
    name: '2003–2009',
    shortName: '03–09',
    era: '2003–2009',
    description: '10-8-6-5-4-3-2-1',
    points: [10, 8, 6, 5, 4, 3, 2, 1],
    fastestLapBonus: 0,
    fastestLapRequiresTopN: null,
  },
  {
    id: '2010-2018',
    name: '2010–2018',
    shortName: '10–18',
    era: '2010–2018',
    description: '25-18-15-12-10-8-6-4-2-1',
    points: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    fastestLapBonus: 0,
    fastestLapRequiresTopN: null,
  },
  {
    id: '2019-2024',
    name: '2019–2024',
    shortName: '19–24',
    era: '2019–2024',
    description: '25-18-15-12-10-8-6-4-2-1 + 1pt FL (top 10)',
    points: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    fastestLapBonus: 1,
    fastestLapRequiresTopN: 10,
  },
  {
    id: '2025-present',
    name: '2025–Present',
    shortName: '25+',
    era: '2025–present',
    description: '25-18-15-12-10-8-6-4-2-1 (no FL bonus)',
    points: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    fastestLapBonus: 0,
    fastestLapRequiresTopN: null,
  },
]

export function getSystemById(id: string): ScoringSystem | undefined {
  return SCORING_SYSTEMS.find((s) => s.id === id)
}

export function createCustomSystem(
  positionPoints: number[],
  flBonus: number = 0,
  flTopN: number | null = null
): ScoringSystem {
  return {
    id: 'custom',
    name: 'Custom System',
    shortName: 'Custom',
    era: 'Custom',
    description: positionPoints.slice(0, 5).join('-') + (positionPoints.length > 5 ? '-...' : ''),
    points: positionPoints,
    fastestLapBonus: flBonus,
    fastestLapRequiresTopN: flTopN,
  }
}

// ── Core Recalculation Functions (pure) ────────────────────

export function recalculatePoints(
  races: RaceResult[],
  system: ScoringSystem
): NormalizedRaceResult[] {
  return races.map((race) => {
    const posNum = parseInt(race.position, 10)
    const isClassified = !Number.isNaN(posNum) && posNum > 0

    let recalculated = 0
    if (isClassified && posNum <= system.points.length) {
      recalculated = system.points[posNum - 1]
    }

    let flApplied = false
    if (system.fastestLapBonus > 0 && race.fastestLapRank === 1) {
      const meetsTopN =
        system.fastestLapRequiresTopN === null ||
        (isClassified && posNum <= system.fastestLapRequiresTopN)
      if (meetsTopN) {
        recalculated += system.fastestLapBonus
        flApplied = true
      }
    }

    return {
      season: race.season,
      round: race.round,
      raceName: race.raceName || `Round ${race.round}`,
      position: isClassified ? posNum : null,
      grid: race.grid,
      status: race.status,
      actualPoints: race.points,
      recalculatedPoints: recalculated,
      delta: Number((recalculated - race.points).toFixed(1)),
      fastestLapBonusApplied: flApplied,
      constructorId: race.constructor?.constructorId,
      constructorName: race.constructor?.name,
    }
  })
}

export function aggregateBySeasons(results: NormalizedRaceResult[]): SeasonSummary[] {
  const bySeason: Record<string, NormalizedRaceResult[]> = {}
  for (const r of results) {
    bySeason[r.season] ||= []
    bySeason[r.season].push(r)
  }

  return Object.keys(bySeason)
    .sort()
    .map((season) => {
      const races = bySeason[season]
      const actualTotal = Number(races.reduce((s, r) => s + r.actualPoints, 0).toFixed(1))
      const recalculatedTotal = Number(races.reduce((s, r) => s + r.recalculatedPoints, 0).toFixed(1))
      return {
        season,
        actualTotal,
        recalculatedTotal,
        delta: Number((recalculatedTotal - actualTotal).toFixed(1)),
        races,
        raceCount: races.length,
      }
    })
}

export function normalizeDriver(
  driverId: string,
  driverName: string,
  races: RaceResult[],
  system: ScoringSystem
): NormalizerResult {
  const normalized = recalculatePoints(races, system)
  const seasons = aggregateBySeasons(normalized)
  const careerActualTotal = Number(seasons.reduce((s, ss) => s + ss.actualTotal, 0).toFixed(1))
  const careerRecalculatedTotal = Number(seasons.reduce((s, ss) => s + ss.recalculatedTotal, 0).toFixed(1))

  return {
    driverId,
    driverName,
    system,
    seasons,
    careerActualTotal,
    careerRecalculatedTotal,
    careerDelta: Number((careerRecalculatedTotal - careerActualTotal).toFixed(1)),
  }
}
