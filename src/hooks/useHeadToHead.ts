import { useState, useEffect, useMemo } from 'react'
import { getHeadToHead } from '../lib/ergast'
import type { Driver, HeadToHead } from '../types'

type UseHeadToHeadOptions = {
  driverA: Driver | null
  driverB: Driver | null
}

type UseHeadToHeadResult = {
  h2h: HeadToHead | null
  loading: boolean
  error: string | null
}

export function useHeadToHead({ driverA, driverB }: UseHeadToHeadOptions): UseHeadToHeadResult {
  const [h2h, setH2h] = useState<HeadToHead | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bothSelected = useMemo(() => driverA && driverB, [driverA, driverB])

  useEffect(() => {
    if (!bothSelected || !driverA || !driverB) {
      setH2h(null)
      return
    }

    setLoading(true)
    setError(null)

    getHeadToHead(driverA.driverId, driverB.driverId)
      .then((result) => setH2h(result as HeadToHead))
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Failed to load head-to-head data'
        setError(message)
        setH2h(null)
      })
      .finally(() => setLoading(false))
  }, [driverA?.driverId, driverB?.driverId, bothSelected])

  return { h2h, loading, error }
}
