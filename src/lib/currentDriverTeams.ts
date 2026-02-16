// Current driver-team mappings for 2026 season
// The Ergast API is no longer updated, so we need manual overrides for current teams

export type CurrentTeamInfo = {
  constructorId: string
  name: string
  since: number // Year they joined
}

// 2026 F1 Driver lineup
const currentDriverTeams: Record<string, CurrentTeamInfo> = {
  // Ferrari
  'hamilton': { constructorId: 'ferrari', name: 'Ferrari', since: 2025 },
  'leclerc': { constructorId: 'ferrari', name: 'Ferrari', since: 2019 },

  // Red Bull (Hadjar promoted from Racing Bulls for 2026)
  'max_verstappen': { constructorId: 'red_bull', name: 'Red Bull', since: 2016 },
  'hadjar': { constructorId: 'red_bull', name: 'Red Bull', since: 2026 },

  // Mercedes
  'russell': { constructorId: 'mercedes', name: 'Mercedes', since: 2022 },
  'antonelli': { constructorId: 'mercedes', name: 'Mercedes', since: 2025 },

  // McLaren
  'norris': { constructorId: 'mclaren', name: 'McLaren', since: 2019 },
  'piastri': { constructorId: 'mclaren', name: 'McLaren', since: 2023 },

  // Aston Martin
  'alonso': { constructorId: 'aston_martin', name: 'Aston Martin', since: 2023 },
  'stroll': { constructorId: 'aston_martin', name: 'Aston Martin', since: 2021 },

  // Alpine
  'gasly': { constructorId: 'alpine', name: 'Alpine', since: 2023 },
  'colapinto': { constructorId: 'alpine', name: 'Alpine', since: 2025 },

  // Williams
  'sainz': { constructorId: 'williams', name: 'Williams', since: 2025 },
  'albon': { constructorId: 'williams', name: 'Williams', since: 2022 },

  // Racing Bulls (Lindblad rookie for 2026)
  'lawson': { constructorId: 'rb', name: 'Racing Bulls', since: 2025 },
  'lindblad': { constructorId: 'rb', name: 'Racing Bulls', since: 2026 },

  // Haas
  'ocon': { constructorId: 'haas', name: 'Haas', since: 2025 },
  'bearman': { constructorId: 'haas', name: 'Haas', since: 2025 },

  // Audi (formerly Kick Sauber)
  'hulkenberg': { constructorId: 'audi', name: 'Audi', since: 2025 },
  'bortoleto': { constructorId: 'audi', name: 'Audi', since: 2025 },

  // Cadillac (new team for 2026)
  'bottas': { constructorId: 'cadillac', name: 'Cadillac', since: 2026 },
  'perez': { constructorId: 'cadillac', name: 'Cadillac', since: 2026 },

  // Recent drivers who left F1
  'tsunoda': { constructorId: 'red_bull', name: 'Red Bull', since: 2025 }, // Left end of 2025
  'ricciardo': { constructorId: 'rb', name: 'RB', since: 2024 }, // Left mid-2024
  'zhou': { constructorId: 'sauber', name: 'Kick Sauber', since: 2022 }, // Left end of 2024
  'magnussen': { constructorId: 'haas', name: 'Haas', since: 2022 }, // Left end of 2024
  'sargeant': { constructorId: 'williams', name: 'Williams', since: 2023 }, // Left mid-2024
  'doohan': { constructorId: 'alpine', name: 'Alpine', since: 2025 }, // Dropped after 6 races in 2025
}

/**
 * Get the current team for a driver (2025/2026 season)
 * Returns null if driver is not in current lineup (retired/historic driver)
 */
export function getCurrentTeam(driverId: string): CurrentTeamInfo | null {
  return currentDriverTeams[driverId] || null
}

/**
 * Check if a driver is currently active in F1 (2025 season)
 */
export function isCurrentDriver(driverId: string): boolean {
  const team = currentDriverTeams[driverId]
  if (!team) return false
  // Consider drivers who joined in 2026 or are still on the grid
  return team.since <= 2026
}

/**
 * Get all current drivers for a constructor
 */
export function getConstructorDrivers(constructorId: string): string[] {
  return Object.entries(currentDriverTeams)
    .filter(([_, info]) => info.constructorId === constructorId && info.since <= 2026)
    .map(([driverId]) => driverId)
}
