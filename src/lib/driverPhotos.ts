// Driver photo utilities

import type { Driver } from '../types'

const CURRENT_SEASON = 2025
const F1_OFFICIAL_START_YEAR = 2019 // F1 has official driver images from 2019 onwards

// Wikipedia image overrides for drivers who retired 2018 or earlier
// These drivers don't have F1 official images available
// URLs verified from Wikipedia API
const DRIVER_PHOTO_OVERRIDES: Record<string, string> = {
  // === World Champions (pre-2019) ===
  // Michael Schumacher - 7x WDC (retired 2012)
  schumacher: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Michael_Schumacher_china_2012_rotated.png',
  michael_schumacher: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Michael_Schumacher_china_2012_rotated.png',

  // Ayrton Senna - 3x WDC (died 1994)
  senna: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Ayrton_Senna_8_%28cropped%29.jpg',
  ayrton_senna: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Ayrton_Senna_8_%28cropped%29.jpg',

  // Alain Prost - 4x WDC (retired 1993)
  prost: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Festival_automobile_international_2015_-_Photocall_-_065_%28cropped3%29.jpg',
  alain_prost: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Festival_automobile_international_2015_-_Photocall_-_065_%28cropped3%29.jpg',

  // Mika Häkkinen - 2x WDC (retired 2001)
  hakkinen: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Mika_H%C3%A4kkinen_Champions_for_Charity_2016-07-27.jpg',
  mika_hakkinen: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Mika_H%C3%A4kkinen_Champions_for_Charity_2016-07-27.jpg',

  // Niki Lauda - 3x WDC (retired 1985)
  lauda: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Lauda_at_1982_Dutch_Grand_Prix.jpg',
  niki_lauda: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Lauda_at_1982_Dutch_Grand_Prix.jpg',

  // Nelson Piquet - 3x WDC (retired 1991)
  piquet: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Cerimonia_de_entrega_da_medalha_Bras%C3%ADlia_60_anos_-_16.jpg',
  nelson_piquet: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Cerimonia_de_entrega_da_medalha_Bras%C3%ADlia_60_anos_-_16.jpg',

  // Nigel Mansell - 1x WDC (retired 1995)
  mansell: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Nigel_Mansell_-_Mexican_Grand_Prix_01_%28cropped%29.jpeg',
  nigel_mansell: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Nigel_Mansell_-_Mexican_Grand_Prix_01_%28cropped%29.jpeg',

  // Damon Hill - 1x WDC (retired 1999)
  hill: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Minister_for_Sport_Hugh_Robertson_at_launch_of_GREAT_campaign%2C_Australia_%286841281192%29_%28cropped%29.jpg',
  damon_hill: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Minister_for_Sport_Hugh_Robertson_at_launch_of_GREAT_campaign%2C_Australia_%286841281192%29_%28cropped%29.jpg',

  // Jacques Villeneuve - 1x WDC (retired 2006)
  villeneuve: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Jacques_Villeneuve_August_2011.jpg',
  jacques_villeneuve: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Jacques_Villeneuve_August_2011.jpg',

  // Jenson Button - 1x WDC (retired 2017)
  button: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Jenson_Button_2024_WEC_Fuji.jpg',
  jenson_button: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Jenson_Button_2024_WEC_Fuji.jpg',

  // Nico Rosberg - 1x WDC (retired 2016)
  rosberg: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Nico_Rosberg_2016.jpg',
  nico_rosberg: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Nico_Rosberg_2016.jpg',

  // === Other Notable Pre-2019 Drivers ===
  // David Coulthard (retired 2008)
  coulthard: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/David_Coulthard_Champions_for_Charity_2022_%28cropped%29.jpg',
  david_coulthard: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/David_Coulthard_Champions_for_Charity_2022_%28cropped%29.jpg',

  // Rubens Barrichello (retired 2011)
  barrichello: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Rubinho.jpg',
  rubens_barrichello: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Rubinho.jpg',

  // Eddie Irvine (retired 2002)
  irvine: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Eddie_Irvine_after_the_1999_Australian_Grand_Prix.jpg',
  eddie_irvine: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Eddie_Irvine_after_the_1999_Australian_Grand_Prix.jpg',

  // Ralf Schumacher (retired 2007)
  ralf_schumacher: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Ralf_Schumacher%2C_2016.png',

  // Juan Pablo Montoya (retired 2006)
  montoya: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/DSC1509_%2851683678455%29%28cropped%29.jpg',
  juan_pablo_montoya: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/DSC1509_%2851683678455%29%28cropped%29.jpg',

  // Felipe Massa (retired 2017)
  massa: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Felipe_Massa.jpg',
  felipe_massa: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Felipe_Massa.jpg',

  // Jos Verstappen (retired 2003)
  jos_verstappen: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Jos_Verstappen%2C_2006.jpg',

  // Jarno Trulli (retired 2011)
  trulli: 'https://upload.wikimedia.org/wikipedia/commons/3/30/12._Internationale_Sportnacht_Davos_2014_%2815246044859%29_%28cropped%29.jpg',
  jarno_trulli: 'https://upload.wikimedia.org/wikipedia/commons/3/30/12._Internationale_Sportnacht_Davos_2014_%2815246044859%29_%28cropped%29.jpg',
}

// Transliterate special characters to ASCII equivalents
function normalizeToAscii(str: string): string {
  return str
    .normalize('NFD') // Decompose accented characters (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .replace(/[^a-z]/g, '') // Remove any remaining non-letter characters
}

function buildDriverPhotoUrl(slug: string, year: number): string {
  return `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${year}Drivers/${slug}.png`
}

function lookupOverride(driver: Driver): string | undefined {
  // Try various key formats to match overrides
  const variants = [
    driver.driverId?.toLowerCase(),
    normalizeToAscii(driver.familyName), // e.g., "hakkinen" from "Häkkinen"
    `${normalizeToAscii(driver.givenName)}_${normalizeToAscii(driver.familyName)}`,
    normalizeToAscii(`${driver.givenName}${driver.familyName}`),
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
  // Check for Wikipedia override first (for pre-2019 drivers)
  const override = lookupOverride(driver)
  if (override) return override

  // Normalize family name to ASCII (handles Räikkönen → raikkonen, Pérez → perez, etc.)
  const slug = normalizeToAscii(driver.familyName)

  // Determine which year's photo to use
  // For current drivers, use current season
  // For retired drivers (2019+), use their last season
  const photoYear = lastSeason && lastSeason < CURRENT_SEASON ? lastSeason : CURRENT_SEASON

  return buildDriverPhotoUrl(slug, photoYear)
}

/**
 * Determine if we should use Wikipedia/legacy photos for a driver
 * Only use legacy photos for drivers who retired before 2019 (no F1 official images available)
 */
export function shouldUseLegacyPhoto(lastSeason: number | null | undefined): boolean {
  const season = lastSeason ?? CURRENT_SEASON
  return season < F1_OFFICIAL_START_YEAR // Only use Wikipedia for pre-2019 drivers
}

// Fetch Wikipedia photo for legacy drivers (fallback when no override exists)
export async function fetchLegacyDriverPhoto(driver: Driver): Promise<string | null> {
  // First check overrides
  const override = lookupOverride(driver)
  if (override) return override

  // Try Wikipedia API with normalized name (no special characters)
  const normalizedName = `${normalizeToAscii(driver.givenName)} ${normalizeToAscii(driver.familyName)}`.trim()
  const originalName = `${driver.givenName} ${driver.familyName}`.trim()

  const candidates = [
    originalName,
    normalizedName,
    `${originalName} (racing driver)`,
    `${normalizedName} (racing driver)`,
    `${originalName} (Formula One)`,
    driver.familyName,
  ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates

  for (const title of candidates) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      if (data?.type === 'disambiguation') continue

      const thumb = data?.originalimage?.source || data?.thumbnail?.source
      if (thumb) return thumb
    } catch {
      continue
    }
  }

  return null
}
