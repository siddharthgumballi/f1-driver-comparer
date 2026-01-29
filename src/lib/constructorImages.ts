// Constructor car images and related utilities

import type { DriverStats } from '../types'

const CURRENT_SEASON = 2025

// Map of constructor IDs to their 2025 car image URLs
export const CONSTRUCTOR_CARS: Record<string, string> = {
  mercedes:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/mercedes.png',
  red_bull:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/red-bull-racing.png',
  ferrari:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/ferrari.png',
  mclaren:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/mclaren.png',
  alpine:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/alpine.png',
  aston_martin:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/aston-martin.png',
  alphatauri:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/rb.png',
  racing_bulls:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/rb.png',
  rb: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/rb.png',
  alfa: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/kick-sauber.png',
  sauber:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/kick-sauber.png',
  kick_sauber:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/kick-sauber.png',
  williams:
    'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/williams.png',
  haas: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2025/haas-f1-team.png',
}

function constructorSlugFromName(name: string): string {
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

export function getConstructorCarUrl(
  year: number,
  constructorId: string,
  constructorName: string
): string {
  const id = constructorId.toLowerCase()
  if (year >= CURRENT_SEASON && CONSTRUCTOR_CARS[id]) return CONSTRUCTOR_CARS[id]

  const slugById: Record<string, string> = {
    red_bull: 'red-bull-racing',
    alfa: year >= 2024 ? 'kick-sauber' : year === 2021 ? 'alfa' : 'alfa-romeo',
    kick_sauber: 'kick-sauber',
    sauber: 'sauber',
    alphatauri: year >= 2024 ? 'rb' : 'alphatauri',
    racing_bulls: 'rb',
    rb: 'rb',
    toro_rosso: 'toro-rosso',
  }

  let slug = slugById[id]

  if (!slug) {
    slug = constructorSlugFromName(constructorName)
  }

  if (year === 2024) {
    if (
      constructorName.toLowerCase().includes('kick') ||
      constructorName.toLowerCase().includes('sauber') ||
      constructorName.toLowerCase().includes('alfa')
    ) {
      slug = 'kick-sauber'
    }
  }

  if (!slug || slug === 'alfa') {
    if (constructorName.toLowerCase().includes('alfa')) {
      if (year === 2021) {
        slug = 'alfa'
      } else if (year >= 2024) {
        slug = 'kick-sauber'
      } else {
        slug = 'alfa-romeo'
      }
    }
  }

  return `https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/${year}/${slug}.png`
}

export function getDriverCarImage(
  stats: DriverStats | null,
  year?: number
): { src: string; alt: string } | null {
  if (!stats) return null
  const targetYear = year || stats.activeYears?.to
  if (!targetYear || !stats.constructors?.length) return null

  const pick = [...stats.constructors]
    .map((c) => ({ c, latest: Math.max(...c.seasons) }))
    .sort((x, y) => y.latest - x.latest)[0]
  if (!pick) return null

  const constructor = pick.c
  return {
    src: getConstructorCarUrl(targetYear, constructor.constructorId, constructor.name),
    alt: `${constructor.name} ${targetYear} car`,
  }
}

export function splitConstructorStints(
  constructors: { constructorId: string; name: string; seasons: number[]; starts: number; wins: number; podiums: number; points: number }[],
  seasonStats: { season: number; starts: number; wins: number; podiums: number; points: number; poles: number; fastestLaps: number }[] = []
) {
  const stints: Array<{
    constructorId: string
    name: string
    seasons: number[]
    stintId: string
    starts: number
    wins: number
    podiums: number
    points: number
    poles: number
    fastestLaps: number
  }> = []

  constructors.forEach((constructor) => {
    const seasons = [...constructor.seasons].sort((a, b) => a - b)
    let currentStint = [seasons[0]]

    for (let i = 1; i < seasons.length; i++) {
      if (seasons[i] === seasons[i - 1] + 1) {
        currentStint.push(seasons[i])
      } else {
        const stintStats = calculateStintStats(currentStint, seasonStats)
        stints.push({
          ...constructor,
          seasons: currentStint,
          stintId: `${constructor.constructorId}-${currentStint[0]}`,
          ...stintStats,
        })
        currentStint = [seasons[i]]
      }
    }

    if (currentStint.length > 0) {
      const stintStats = calculateStintStats(currentStint, seasonStats)
      stints.push({
        ...constructor,
        seasons: currentStint,
        stintId: `${constructor.constructorId}-${currentStint[0]}`,
        ...stintStats,
      })
    }
  })

  return stints.sort((a, b) => Math.max(...b.seasons) - Math.max(...a.seasons))
}

function calculateStintStats(
  stintSeasons: number[],
  seasonStats: { season: number; starts: number; wins: number; podiums: number; points: number; poles: number; fastestLaps: number }[]
) {
  const relevantStats = seasonStats.filter((stat) => stintSeasons.includes(stat.season))

  return {
    starts: relevantStats.reduce((sum, stat) => sum + stat.starts, 0),
    wins: relevantStats.reduce((sum, stat) => sum + stat.wins, 0),
    podiums: relevantStats.reduce((sum, stat) => sum + stat.podiums, 0),
    points: relevantStats.reduce((sum, stat) => sum + stat.points, 0),
    poles: relevantStats.reduce((sum, stat) => sum + stat.poles, 0),
    fastestLaps: relevantStats.reduce((sum, stat) => sum + stat.fastestLaps, 0),
  }
}
