const API = 'https://api.jolpi.ca/ergast/f1'

// Rate limiting and retry configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial retry delay

// Track the last request time for rate limiting
let lastRequestTime = 0;

let liveMode = false
export function setLiveMode(enabled: boolean) {
  liveMode = enabled
}

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

type RaceResult = {
  season: string
  round: number
  grid: number
  position: string
  status: string
  points: number
  driver: Driver
  constructor?: { constructorId: string; name: string }
  fastestLapRank: number | null
}

const oneDay = 5 * 60 * 1000

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    if (Date.now() - t > oneDay) return null
    return v as T
  } catch {
    return null
  }
}

function cacheSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }))
  } catch {}
}

async function fetchJSON<T>(url: string, retryCount = 0): Promise<T> {
  // Rate limiting: ensure we don't make requests too quickly
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }

  // Add cache-busting when in live mode
  const bust = liveMode ? (url.includes('?') ? `&_ts=${Date.now()}` : `?_ts=${Date.now()}`) : ''
  const finalUrl = url + bust
  const cacheKey = `erg:${finalUrl}`

  // Use cache in non-live mode
  if (!liveMode) {
    const cached = cacheGet<T>(cacheKey);
    if (cached) return cached;
  }

  try {
    lastRequestTime = Date.now();
    const res = await fetch(finalUrl, { 
      cache: liveMode ? 'no-store' : 'default' 
    });

    // Handle rate limiting (429) with retry logic
    if (res.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10) * 1000;
        const delay = retryAfter || (RETRY_DELAY * (retryCount + 1));
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchJSON<T>(url, retryCount + 1);
      }
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!liveMode) cacheSet(cacheKey, data);
    return data as T;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchJSON<T>(url, retryCount + 1);
    }
    console.error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts:`, error);
    throw error;
  }
}

export async function getAllDrivers(): Promise<Driver[]> {
  const pageLimit = 100
  let offset = 0
  let total = 0
  const list: Driver[] = []
  do {
    const url = `${API}/drivers.json?limit=${pageLimit}&offset=${offset}`
    const data = await fetchJSON<any>(url)
    const drivers: any[] = (data?.MRData?.DriverTable?.Drivers as any[]) || []
    for (const d of drivers) {
      list.push({
        driverId: d.driverId,
        givenName: d.givenName,
        familyName: d.familyName,
        code: d.code,
        permanentNumber: d.permanentNumber,
        nationality: d.nationality,
      })
    }
    total = Number(data?.MRData?.total || drivers.length)
    offset += pageLimit
  } while (list.length < total)
  return list.sort((a, b) => a.familyName.localeCompare(b.familyName))
}

export async function getDriverById(driverId: string): Promise<Driver | null> {
  const all = await getAllDrivers()
  return all.find(d => d.driverId === driverId) ?? null
}

export async function getDriverStats(driverId: string): Promise<DriverStats> {
  const results = await getDriverResults(driverId)
  const sprint = await getDriverSprintResults(driverId)
  if (results.length === 0) {
    const d = (await getDriverById(driverId)) || { driverId, givenName: '', familyName: '' }
    return {
      driver: d,
      starts: 0,
      wins: 0,
      podiums: 0,
      points: 0,
      avgGrid: null,
      avgFinish: null,
      dnfs: 0,
      activeYears: { from: 0, to: 0 },
      poles: 0,
      fastestLaps: 0,
      championships: 0,
      bestFinish: null,
      bestGrid: null,
      top10: 0,
      frontRow: 0,
      seasons: [],
      constructors: [],
    }
  }

  const starts = results.length
  const wins = results.filter(r => r.position === '1').length
  const podiums = results.filter(r => ['1', '2', '3'].includes(r.position)).length
  const gpPoints = results.reduce((s, r) => s + (Number(r.points) || 0), 0)
  const sprintTotal = sprint.reduce((s, r) => s + (Number(r.points) || 0), 0)
  const points = gpPoints + sprintTotal

  const grids = results.map(r => r.grid).filter(n => n && n > 0)
  const avgGrid = grids.length ? Number((grids.reduce((a, b) => a + b, 0) / grids.length).toFixed(2)) : null

  const finishPos = results
    .map(r => parseInt(r.position, 10))
    .filter(n => !Number.isNaN(n) && n > 0)
  const avgFinish = finishPos.length ? Number((finishPos.reduce((a, b) => a + b, 0) / finishPos.length).toFixed(2)) : null

  const dnfs = results.filter(r => isDNF(r)).length

  const years = Array.from(new Set(results.map(r => parseInt(r.season, 10)))).sort((a, b) => a - b)
  const activeYears = { from: years[0], to: years[years.length - 1] }

  const poles = results.filter(r => r.grid === 1).length
  const fastestLaps = results.filter(r => r.fastestLapRank === 1).length
  const bestGrid = grids.length ? Math.min(...grids) : null
  const bestFinish = finishPos.length ? Math.min(...finishPos) : null
  const top10 = results.filter(r => {
    const p = parseInt(r.position, 10)
    return !Number.isNaN(p) && p > 0 && p <= 10
  }).length
  const frontRow = results.filter(r => r.grid > 0 && r.grid <= 2).length

  const bySeason: Record<number, RaceResult[]> = {}
  for (const r of results) {
    const s = parseInt(r.season, 10)
    bySeason[s] ||= []
    bySeason[s].push(r)
  }
  const sprintBySeason: Record<number, number> = {}
  for (const s of sprint) {
    const seasonNum = parseInt(s.season as unknown as string, 10)
    sprintBySeason[seasonNum] = (sprintBySeason[seasonNum] || 0) + (Number(s.points) || 0)
  }
  const seasons: SeasonStat[] = Object.keys(bySeason)
    .map(n => parseInt(n, 10))
    .sort((a, b) => a - b)
    .map(season => {
      const rs = bySeason[season]
      const g = rs.map(r => r.grid).filter(n => n && n > 0)
      const f = rs.map(r => parseInt(r.position, 10)).filter(n => !Number.isNaN(n) && n > 0)
      return {
        season,
        starts: rs.length,
        wins: rs.filter(r => r.position === '1').length,
        podiums: rs.filter(r => ['1', '2', '3'].includes(r.position)).length,
        points: Number((rs.reduce((s, r) => s + (Number(r.points) || 0), 0) + (sprintBySeason[season] || 0)).toFixed(1)),
        avgGrid: g.length ? Number((g.reduce((a, b) => a + b, 0) / g.length).toFixed(2)) : null,
        avgFinish: f.length ? Number((f.reduce((a, b) => a + b, 0) / f.length).toFixed(2)) : null,
        poles: rs.filter(r => r.grid === 1).length,
        fastestLaps: rs.filter(r => r.fastestLapRank === 1).length,
      }
    })

  // First, process race results for constructors
  const byConstructor: Record<string, ConstructorSummary> = {}
  
  // Process race results
  for (const r of results) {
    if (!r.constructor) continue
    const id = r.constructor.constructorId
    if (!byConstructor[id]) {
      byConstructor[id] = {
        constructorId: id,
        name: r.constructor.name,
        starts: 0,
        wins: 0,
        podiums: 0,
        points: 0,
        seasons: [],
      }
    }
    const c = byConstructor[id]
    c.starts += 1
    if (r.position === '1') c.wins += 1
    if (['1', '2', '3'].includes(r.position)) c.podiums += 1
    c.points += Number(r.points) || 0
    const s = parseInt(r.season, 10)
    if (!c.seasons.includes(s)) c.seasons.push(s)
  }
  
  // Now add sprint points to constructors
  for (const s of sprint) {
    const season = parseInt(s.season as unknown as string, 10)
    const round = s.round
    
    // Find the race result for this sprint to get the constructor
    const raceResult = results.find(r => 
      parseInt(r.season, 10) === season && r.round === round
    )
    
    if (raceResult?.constructor) {
      const id = raceResult.constructor.constructorId
      if (byConstructor[id]) {
        byConstructor[id].points = Number((byConstructor[id].points + (Number(s.points) || 0)).toFixed(1))
      }
    }
  }
  const constructors = Object.values(byConstructor).sort((a, b) => b.starts - a.starts)

  const championships = await getChampionshipsCountForSeasons(driverId, years)

  return {
    driver: results[0].driver,
    starts,
    wins,
    podiums,
    points: Number(points.toFixed(1)),
    avgGrid,
    avgFinish,
    dnfs,
    activeYears,
    poles,
    fastestLaps,
    championships,
    bestFinish,
    bestGrid,
    top10,
    frontRow,
    seasons,
    constructors,
  }
}

function isDNF(r: RaceResult) {
  const s = r.status || ''
  if (/^Finished$/i.test(s)) return false
  if (/^\+?\d+ Laps?$/i.test(s)) return false
  const posNum = parseInt(r.position, 10)
  if (!Number.isNaN(posNum) && posNum > 0) return false
  return true
}

async function getDriverResults(driverId: string): Promise<RaceResult[]> {
  const pageLimit = 100
  let offset = 0
  let total = 0
  const races: any[] = []
  do {
    const url = `${API}/drivers/${driverId}/results.json?limit=${pageLimit}&offset=${offset}`
    const data = await fetchJSON<any>(url)
    const rs: any[] = (data?.MRData?.RaceTable?.Races as any[]) || []
    races.push(...rs)
    total = Number(data?.MRData?.total || rs.length)
    offset += pageLimit
  } while (races.length < total)

  const results: RaceResult[] = []
  for (const race of races) {
    const r = race.Results?.[0]
    if (!r) continue
    results.push({
      season: race.season,
      round: Number(race.round),
      grid: Number(r.grid),
      position: String(r.positionText || r.position),
      status: r.status,
      points: Number(r.points),
      driver: {
        driverId: r.Driver.driverId,
        givenName: r.Driver.givenName,
        familyName: r.Driver.familyName,
        code: r.Driver.code,
        permanentNumber: r.Driver.permanentNumber,
        nationality: r.Driver.nationality,
      },
      constructor: r.Constructor ? { constructorId: r.Constructor.constructorId, name: r.Constructor.name } : undefined,
      fastestLapRank: r.FastestLap && r.FastestLap.rank ? Number(r.FastestLap.rank) : null,
    })
  }
  return results
}

async function getDriverSprintResults(driverId: string): Promise<Array<{ season: string; round: number; points: number }>> {
  const pageLimit = 100
  let offset = 0
  let total = 0
  const races: any[] = []
  do {
    const url = `${API}/drivers/${driverId}/sprint.json?limit=${pageLimit}&offset=${offset}`
    const data = await fetchJSON<any>(url)
    const rs: any[] = (data?.MRData?.RaceTable?.Races as any[]) || []
    races.push(...rs)
    total = Number(data?.MRData?.total || rs.length)
    offset += pageLimit
  } while (races.length < total)

  const results: Array<{ season: string; round: number; points: number }> = []
  for (const race of races) {
    const r = race.SprintResults?.[0]
    if (!r) continue
    results.push({
      season: race.season,
      round: Number(race.round),
      points: Number(r.points) || 0,
    })
  }
  return results
}

async function getChampionshipsCount(driverId: string): Promise<number> {
  try {
    // Fallback implementation: attempt to infer seasons from results and call per-season standings
    const results = await getDriverResults(driverId)
    const seasons = Array.from(new Set(results.map(r => parseInt(r.season, 10)))).sort((a,b)=>a-b)
    return await getChampionshipsCountForSeasons(driverId, seasons)
  } catch {
    return 0
  }
}

async function getChampionshipsCountForSeasons(driverId: string, seasons: number[]): Promise<number> {
  let count = 0
  for (const season of seasons) {
    try {
      const url = `${API}/${season}/driverStandings.json?limit=1000`
      const data = await fetchJSON<any>(url)
      const lists: any[] = data?.MRData?.StandingsTable?.StandingsLists || []
      const first = lists[0]?.DriverStandings?.[0]
      if (first && String(first.position) === '1' && first.Driver?.driverId === driverId) {
        count += 1
      }
    } catch {
      // ignore and continue
    }
  }
  return count
}

export type HeadToHead = {
  racesTogether: number
  a: { 
    wins: number; 
    points: number; 
    avgFinish: number | null;
    finishedAhead: number;
  }
  b: { 
    wins: number; 
    points: number; 
    avgFinish: number | null;
    finishedAhead: number;
  }
  bothFinished: number;
}

export async function getHeadToHead(aId: string, bId: string): Promise<HeadToHead> {
  const [aRes, bRes, aSprint, bSprint] = await Promise.all([
    getDriverResults(aId),
    getDriverResults(bId),
    getDriverSprintResults(aId),
    getDriverSprintResults(bId)
  ])
  
  // Create maps for sprint results with points
  const aSprintMap = new Map(aSprint.map(s => [`${s.season}-${s.round}`, s.points]))
  const bSprintMap = new Map(bSprint.map(s => [`${s.season}-${s.round}`, s.points]))
  
  const key = (r: RaceResult) => `${r.season}-${r.round}`
  const aMap = new Map(aRes.map(r => [key(r), r]))
  const pairs: Array<{ 
    a: RaceResult & { sprintPoints?: number }, 
    b: RaceResult & { sprintPoints?: number } 
  }> = []
  
  // Match up race results
  for (const br of bRes) {
    const ar = aMap.get(key(br))
    if (ar) {
      // Add sprint points if they exist for this race
      const aSprintKey = `${ar.season}-${ar.round}`
      const bSprintKey = `${br.season}-${br.round}`
      pairs.push({
        a: { ...ar, sprintPoints: aSprintMap.get(aSprintKey) || 0 },
        b: { ...br, sprintPoints: bSprintMap.get(bSprintKey) || 0 }
      })
    }
  }
  
  const together = pairs.length
  if (!together) {
    return { 
      racesTogether: 0, 
      a: { wins: 0, points: 0, avgFinish: null, finishedAhead: 0 }, 
      b: { wins: 0, points: 0, avgFinish: null, finishedAhead: 0 },
      bothFinished: 0
    }
  }
  
  function sumPoints(xs: Array<RaceResult & { sprintPoints?: number }>) {
    return Number(
      xs.reduce((s, r) => s + (Number(r.points) || 0) + (Number(r.sprintPoints) || 0), 0)
      .toFixed(1)
    )
  }
  
  function avgFinish(xs: RaceResult[]) {
    const arr = xs.map(r => parseInt(r.position, 10)).filter(n => !Number.isNaN(n) && n > 0)
    return arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null
  }
  
  const aWins = pairs.filter(p => p.a.position === '1').length
  const bWins = pairs.filter(p => p.b.position === '1').length
  
  // Calculate direct race comparisons
  let aAhead = 0
  let bAhead = 0
  let bothFinished = 0
  
  for (const { a, b } of pairs) {
    const aPos = parseInt(a.position, 10)
    const bPos = parseInt(b.position, 10)
    
    if (!isNaN(aPos) && !isNaN(bPos) && aPos > 0 && bPos > 0) {
      bothFinished++
      if (aPos < bPos) {
        aAhead++
      } else if (bPos < aPos) {
        bAhead++
      }
      // If positions are equal, neither gets ahead point
    }
  }
  
  return {
    racesTogether: together,
    a: { 
      wins: aWins, 
      points: sumPoints(pairs.map(p => p.a)), 
      avgFinish: avgFinish(pairs.map(p => p.a)),
      finishedAhead: aAhead
    },
    b: { 
      wins: bWins, 
      points: sumPoints(pairs.map(p => p.b)), 
      avgFinish: avgFinish(pairs.map(p => p.b)),
      finishedAhead: bAhead
    },
    bothFinished
  }
}
