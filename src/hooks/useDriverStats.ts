import { useState, useEffect, useCallback } from 'react'
import { getDriverStats } from '../lib/ergast'
import { overlayOpenF1CurrentSeason } from '../lib/openf1'
import type { Driver, DriverStats } from '../types'

type UseDriverStatsOptions = {
  driver: Driver | null
  live: boolean
}

type UseDriverStatsResult = {
  stats: DriverStats | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDriverStats({ driver, live }: UseDriverStatsOptions): UseDriverStatsResult {
  const [stats, setStats] = useState<DriverStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!driver) {
      setStats(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const base = await getDriverStats(driver.driverId)
      const result = live ? await overlayOpenF1CurrentSeason(base) : base
      setStats(result as DriverStats)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load driver stats'
      setError(message)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [driver?.driverId, live])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
