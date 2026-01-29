import { useEffect, useCallback } from 'react'
import type { Driver } from '../types'

type UseUrlStateProps = {
  driverA: Driver | null
  driverB: Driver | null
  onLoadDriverA: (driverId: string) => void
  onLoadDriverB: (driverId: string) => void
}

export function useUrlState({
  driverA,
  driverB,
  onLoadDriverA,
  onLoadDriverB,
}: UseUrlStateProps) {
  // Load drivers from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const aId = params.get('a')
    const bId = params.get('b')
    if (aId) onLoadDriverA(aId)
    if (bId) onLoadDriverB(bId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL with driver selections
  useEffect(() => {
    const params = new URLSearchParams()
    if (driverA) params.set('a', driverA.driverId)
    if (driverB) params.set('b', driverB.driverId)
    const qs = params.toString()
    const url = qs ? `?${qs}` : location.pathname
    window.history.replaceState(null, '', url)
  }, [driverA, driverB])

  const getShareableUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (driverA) params.set('a', driverA.driverId)
    if (driverB) params.set('b', driverB.driverId)
    const qs = params.toString()
    return `${location.origin}${location.pathname}${qs ? `?${qs}` : ''}`
  }, [driverA, driverB])

  return { getShareableUrl }
}
