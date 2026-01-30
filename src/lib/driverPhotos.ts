// Driver photo utilities

import type { Driver } from '../types'

const CURRENT_SEASON = 2025
const F1_OFFICIAL_START_YEAR = 2019 // F1 has official driver images from 2019 onwards

// Only use Wikipedia overrides for drivers before 2019 (no F1 official images available)
const DRIVER_PHOTO_OVERRIDES: Record<string, string> = {
  // Pre-2019 drivers need Wikipedia images
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
  jos_verstappen:
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Jos_Verstappen_2011_WEC.jpg',
  josverstappen:
    'https://upload.wikimedia.org/wikipedia/commons/1/16/Jos_Verstappen_2011_WEC.jpg',
}

const legacyPhotoCache = new Map<string, string>()
const legacyPhotoInFlight = new Map<string, Promise<string | null>>()

function buildDriverPhotoUrl(slug: string, year: number): string {
  return `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${year}Drivers/${slug}.png`
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

/**
 * Get the F1 official driver photo URL
 * @param driver - The driver object
 * @param lastSeason - The driver's last active season (used for retired drivers)
 * @returns URL to the driver photo
 */
export function getDriverPhotoUrl(driver: Driver, lastSeason?: number | null): string {
  const override = lookupOverride(driver)
  if (override) return override

  const slug = driver.familyName.toLowerCase().replace(/[^a-z]/g, '')

  // Determine which year's photo to use
  // For current drivers, use current season
  // For retired drivers (2019+), use their last season
  const photoYear = lastSeason && lastSeason < CURRENT_SEASON ? lastSeason : CURRENT_SEASON

  return buildDriverPhotoUrl(slug, photoYear)
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

/**
 * Determine if we should use Wikipedia/legacy photos for a driver
 * Only use legacy photos for drivers who retired before 2019 (no F1 official images available)
 */
export function shouldUseLegacyPhoto(lastSeason: number | null | undefined): boolean {
  const season = lastSeason ?? CURRENT_SEASON
  return season < F1_OFFICIAL_START_YEAR // Only use Wikipedia for pre-2019 drivers
}
