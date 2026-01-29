// Centralized type definitions for F1 Driver Comparer

export type Driver = {
  driverId: string
  givenName: string
  familyName: string
  code?: string
  permanentNumber?: string
  nationality?: string
}

export type SeasonStat = {
  season: number
  starts: number
  wins: number
  podiums: number
  points: number
  avgGrid: number | null
  avgFinish: number | null
  poles: number
  fastestLaps: number
}

export type ConstructorSummary = {
  constructorId: string
  name: string
  starts: number
  wins: number
  podiums: number
  points: number
  seasons: number[]
}

export type DriverStats = {
  driver: Driver
  starts: number
  wins: number
  podiums: number
  points: number
  avgGrid: number | null
  avgFinish: number | null
  dnfs: number
  activeYears: { from: number; to: number }
  poles: number
  fastestLaps: number
  championships: number
  bestFinish: number | null
  bestGrid: number | null
  top10: number
  frontRow: number
  seasons: SeasonStat[]
  constructors: ConstructorSummary[]
}

export type HeadToHead = {
  racesTogether: number
  a: {
    wins: number
    points: number
    avgFinish: number | null
    finishedAhead: number
  }
  b: {
    wins: number
    points: number
    avgFinish: number | null
    finishedAhead: number
  }
  bothFinished: number
}

export type RaceResult = {
  season: string
  round: number
  raceName?: string
  grid: number
  position: string
  status: string
  points: number
  driver: Driver
  constructor?: { constructorId: string; name: string }
  fastestLapRank: number | null
}

export type ConstructorStint = ConstructorSummary & {
  stintId: string
}

// Component prop types
export type DriverAvatarProps = {
  driver: Driver
  accent: 'red' | 'cyan'
  lastSeason?: number | null
  size?: 'sm' | 'md' | 'lg'
}

export type DriverCardProps = {
  stats: DriverStats
  accent: 'red' | 'cyan'
  label: string
}

export type HeadToHeadProps = {
  h2h: HeadToHead
  driverA: Driver
  driverB: Driver
}

export type ComparisonBarProps = {
  label: string
  valueA: number
  valueB: number
  total?: number
  showSubtext?: string
}
