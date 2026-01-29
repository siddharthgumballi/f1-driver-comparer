// Driver photo utilities

import type { Driver } from '../types'

const CURRENT_SEASON = 2025

const DRIVER_PHOTO_OVERRIDES: Record<string, string> = {
  jos_verstappen:
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Jos_Verstappen_2011_WEC.jpg',
  josverstappen:
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Jos_Verstappen_2011_WEC.jpg',
  vettel:
    'https://upload.wikimedia.org/wikipedia/commons/8/8b/Sebastian_Vettel_2017_Malaysia_2.jpg',
  sebastian_vettel:
    'https://upload.wikimedia.org/wikipedia/commons/8/8b/Sebastian_Vettel_2017_Malaysia_2.jpg',
  sebastianvettel:
    'https://upload.wikimedia.org/wikipedia/commons/8/8b/Sebastian_Vettel_2017_Malaysia_2.jpg',
  ricciardo:
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Daniel_Ricciardo_2017_Malaysia_3.jpg',
  daniel_ricciardo:
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Daniel_Ricciardo_2017_Malaysia_3.jpg',
  danielricciardo:
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Daniel_Ricciardo_2017_Malaysia_3.jpg',
  schumacher:
    'https://upload.wikimedia.org/wikipedia/commons/0/06/Michael_Schumacher_2010_Malaysia_3rd_Free_Practice.jpg',
  michael_schumacher:
    'https://upload.wikimedia.org/wikipedia/commons/0/06/Michael_Schumacher_2010_Malaysia_3rd_Free_Practice.jpg',
  michaelschumacher:
    'https://upload.wikimedia.org/wikipedia/commons/0/06/Michael_Schumacher_2010_Malaysia_3rd_Free_Practice.jpg',
  ralf_schumacher:
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Ralf_Schumacher_at_2014_DTM_Temperary_Pit.jpg',
  ralfschumacher:
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Ralf_Schumacher_at_2014_DTM_Temperary_Pit.jpg',
}

const legacyPhotoCache = new Map<string, string>()
const legacyPhotoInFlight = new Map<string, Promise<string | null>>()

function buildDriverPhotoUrl(slug: string): string {
  return `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${CURRENT_SEASON}Drivers/${slug}.png`
}

function lookupOverride(driver: Driver): string | undefined {
  const variants = [
    driver.driverId?.toLowerCase(),
    `${driver.givenName}_${driver.familyName}`.toLowerCase(),
    `${driver.givenName}${driver.familyName}`.toLowerCase().replace(/[^a-z]/g, ''),
  ].filter(Boolean) as string[]

  for (const key of variants) {
    const hit = DRIVER_PHOTO_OVERRIDES[key]
    if (hit) return hit
  }
  return undefined
}

export function getDriverPhotoUrl(driver: Driver): string {
  const override = lookupOverride(driver)
  if (override) return override

  const slug = driver.familyName.toLowerCase().replace(/[^a-z]/g, '')
  return buildDriverPhotoUrl(slug)
}

function isPortraitish(meta: { thumbnail?: { width?: number; height?: number }; originalimage?: { width?: number; height?: number } }): boolean {
  const width = meta?.thumbnail?.width ?? meta?.originalimage?.width
  const height = meta?.thumbnail?.height ?? meta?.originalimage?.height
  if (!width || !height) return true
  const ratio = width / height
  return ratio >= 0.7 && ratio <= 1.35
}

function descriptionLooksLikeDriver(meta: { description?: string; titles?: { normalized?: string } }): boolean {
  const desc = (meta?.description || meta?.titles?.normalized || '').toString().toLowerCase()
  if (!desc) return true
  return desc.includes('driver') || desc.includes('racing') || desc.includes('motorsport')
}

export async function fetchLegacyDriverPhoto(driver: Driver): Promise<string | null> {
  const cacheKey = driver.driverId || `${driver.givenName}-${driver.familyName}`
  if (legacyPhotoCache.has(cacheKey)) return legacyPhotoCache.get(cacheKey) || null
  if (legacyPhotoInFlight.has(cacheKey)) return legacyPhotoInFlight.get(cacheKey)!

  const attempt = async () => {
    const baseName = `${driver.givenName} ${driver.familyName}`.trim()
    const candidates = [
      `${baseName} (racing driver)`,
      `${baseName} (Formula One)`,
      baseName,
      driver.familyName,
    ].filter(Boolean) as string[]

    for (const title of candidates) {
      try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        const res = await fetch(url)
        if (!res.ok) continue
        const data = await res.json()
        if (data?.type === 'disambiguation') continue
        if (!descriptionLooksLikeDriver(data)) continue
        if (!isPortraitish(data)) continue
        const thumb = data?.originalimage?.source || data?.thumbnail?.source
        if (thumb) {
          legacyPhotoCache.set(cacheKey, thumb)
          return thumb
        }
      } catch {
        continue
      }
    }
    legacyPhotoCache.set(cacheKey, '')
    return null
  }

  const promise = attempt().finally(() => legacyPhotoInFlight.delete(cacheKey))
  legacyPhotoInFlight.set(cacheKey, promise)
  return promise
}

export function shouldUseLegacyPhoto(lastSeason: number | null | undefined): boolean {
  const season = lastSeason ?? CURRENT_SEASON
  return season < CURRENT_SEASON - 2
}
