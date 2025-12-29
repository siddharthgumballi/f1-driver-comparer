import type { DriverStats, SeasonStat } from './ergast'

const OPENF1_API = 'https://api.openf1.org/v1'

export type OpenF1Session = {
  session_key: number
  session_name: string // "Race" | "Sprint" | others
  session_type: string
  year: number
  date_start: string
  date_end: string
  meeting_key: number
}

export type OpenF1Driver = {
  driver_number: number
  name_acronym?: string
  first_name?: string
  last_name?: string
  full_name?: string
  session_key: number
}

export type OpenF1SessionResult = {
  session_key: number
  meeting_key: number
  position: number
  driver_number: number
  dnf: boolean
  dns: boolean
  dsq: boolean
  fastest_lap_rank?: number | null
}

export type DriverRef = {
  driverId: string
  code?: string
  familyName?: string
  permanentNumber?: string
}

export type SessionResult = {
  season: string
  round: number
  position: string
  status: string
  fastestLapRank: number | null
  points: number
  sessionName: string
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as T
}

function sprintPoints(pos: number): number {
  const map = [8, 7, 6, 5, 4, 3, 2, 1]
  return pos >= 1 && pos <= 8 ? map[pos - 1] : 0
}

function racePoints(pos: number): number {
  const map = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
  return pos >= 1 && pos <= 10 ? map[pos - 1] : 0
}

async function getSessionsForYear(year: number): Promise<OpenF1Session[]> {
  const url = `${OPENF1_API}/sessions?year=${year}`
  const data = await fetchJSON<OpenF1Session[]>(url)
  // Only Sprint and Race sessions matter for points
  return (data || []).filter(s => s.session_name === 'Sprint' || s.session_name === 'Race')
}

async function getSessionResults(session_key: number): Promise<OpenF1SessionResult[]> {
  const url = `${OPENF1_API}/session_result?session_key=${session_key}`
  return await fetchJSON<OpenF1SessionResult[]>(url)
}

async function getSessionDrivers(session_key: number): Promise<OpenF1Driver[]> {
  const url = `${OPENF1_API}/drivers?session_key=${session_key}`
  return await fetchJSON<OpenF1Driver[]>(url)
}

function normalize(str?: string | null): string {
  return (str || '').trim().toLowerCase()
}

function matchDriver(
  ref: DriverRef,
  of1Drivers: OpenF1Driver[]
): number | null {
  // 1) permanent number -> driver_number
  if (ref.permanentNumber) {
    const num = parseInt(ref.permanentNumber, 10)
    if (!Number.isNaN(num)) {
      const hit = of1Drivers.find(d => d.driver_number === num)
      if (hit) return hit.driver_number
    }
  }
  // 2) code -> name_acronym
  if (ref.code) {
    const code = normalize(ref.code)
    const hit = of1Drivers.find(d => normalize(d.name_acronym) === code)
    if (hit) return hit.driver_number
  }
  // 3) last name
  if (ref.familyName) {
    const ln = normalize(ref.familyName)
    const hit = of1Drivers.find(d => normalize(d.last_name) === ln || normalize(d.full_name)?.includes(ln))
    if (hit) return hit.driver_number
  }
  return null
}

async function getOpenF1DriverResultsForYear(
  year: number,
  driver: DriverRef
): Promise<SessionResult[]> {
  const sessions = await getSessionsForYear(year)
  // sort by start date to derive a round index
  const sorted = [...sessions].sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

  const results: SessionResult[] = []

  for (let idx = 0; idx < sorted.length; idx++) {
    const s = sorted[idx]
    // fetch drivers and try to map to driver_number
    const [drivers, res] = await Promise.all([
      getSessionDrivers(s.session_key),
      getSessionResults(s.session_key),
    ])
    const driverNumber = matchDriver(driver, drivers)
    if (driverNumber == null) continue

    const me = res.find(r => r.driver_number === driverNumber)
    if (!me) continue

    const pos = me.position
    const pts = s.session_name === 'Sprint' ? sprintPoints(pos) : racePoints(pos)

    results.push({
      season: String(year),
      round: idx + 1,
      position: String(pos),
      status: me.dnf ? 'DNF' : me.dns ? 'DNS' : me.dsq ? 'DSQ' : 'Finished',
      fastestLapRank: me.fastest_lap_rank || null,
      points: pts,
      sessionName: s.session_name,
    })
  }

  return results
}

export async function overlayOpenF1CurrentSeason(stats: DriverStats): Promise<DriverStats> {
  try {
    const year = new Date().getFullYear()
    const seasonStr = String(year)
    
    const ref: DriverRef = {
      driverId: stats.driver.driverId,
      code: stats.driver.code,
      familyName: stats.driver.familyName,
      permanentNumber: stats.driver.permanentNumber,
    }
    
    const sessionResults = await getOpenF1DriverResultsForYear(year, ref)
    if (sessionResults.length === 0) return stats
    
    // Aggregate stats from session results
    let totalPoints = 0
    let starts = 0
    let wins = 0
    let podiums = 0
    let fastestLaps = 0
    let poles = 0
    
    sessionResults.forEach(r => {
      const pos = parseInt(r.position, 10)
      if (!isNaN(pos)) {
        starts++
        if (pos === 1) wins++
        if (pos <= 3) podiums++
      }
      if (r.fastestLapRank === 1) fastestLaps++
      totalPoints += r.points || 0
    })
    
    // Update the current season with OpenF1 data
    const seasons = stats.seasons.map(season => {
      if (String(season.season) !== seasonStr) return season
      return {
        ...season,
        starts, wins, podiums, fastestLaps, poles,
        points: Number(totalPoints.toFixed(1))
      }
    })
    
    return { ...stats, points: Number(totalPoints.toFixed(1)), seasons }
  } catch (error) {
    console.error('OpenF1 overlay failed:', error)
    return stats
  }
}
