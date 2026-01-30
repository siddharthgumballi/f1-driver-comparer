import { useState, useEffect, useCallback } from 'react'
import type { Driver } from '../types'

type Comparison = {
  id: string
  driverA: Driver
  driverB: Driver
  timestamp: number
}

type UseComparisonHistoryResult = {
  recentComparisons: Comparison[]
  favorites: Comparison[]
  addToHistory: (driverA: Driver, driverB: Driver) => void
  addToFavorites: (driverA: Driver, driverB: Driver) => void
  removeFromFavorites: (id: string) => void
  clearHistory: () => void
  isFavorite: (driverA: Driver, driverB: Driver) => boolean
}

const HISTORY_KEY = 'f1-comparer-history'
const FAVORITES_KEY = 'f1-comparer-favorites'
const MAX_HISTORY = 10

function generateId(driverA: Driver, driverB: Driver): string {
  const ids = [driverA.driverId, driverB.driverId].sort()
  return `${ids[0]}-${ids[1]}`
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or unavailable
  }
}

export function useComparisonHistory(): UseComparisonHistoryResult {
  const [recentComparisons, setRecentComparisons] = useState<Comparison[]>(() =>
    loadFromStorage(HISTORY_KEY, [])
  )
  const [favorites, setFavorites] = useState<Comparison[]>(() =>
    loadFromStorage(FAVORITES_KEY, [])
  )

  // Sync to localStorage
  useEffect(() => {
    saveToStorage(HISTORY_KEY, recentComparisons)
  }, [recentComparisons])

  useEffect(() => {
    saveToStorage(FAVORITES_KEY, favorites)
  }, [favorites])

  const addToHistory = useCallback((driverA: Driver, driverB: Driver) => {
    const id = generateId(driverA, driverB)
    const newComparison: Comparison = {
      id,
      driverA,
      driverB,
      timestamp: Date.now(),
    }

    setRecentComparisons((prev) => {
      // Remove existing entry with same id
      const filtered = prev.filter((c) => c.id !== id)
      // Add new entry at the beginning
      const updated = [newComparison, ...filtered]
      // Keep only MAX_HISTORY items
      return updated.slice(0, MAX_HISTORY)
    })
  }, [])

  const addToFavorites = useCallback((driverA: Driver, driverB: Driver) => {
    const id = generateId(driverA, driverB)
    const newFavorite: Comparison = {
      id,
      driverA,
      driverB,
      timestamp: Date.now(),
    }

    setFavorites((prev) => {
      // Don't add if already exists
      if (prev.some((c) => c.id === id)) return prev
      return [newFavorite, ...prev]
    })
  }, [])

  const removeFromFavorites = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setRecentComparisons([])
  }, [])

  const isFavorite = useCallback(
    (driverA: Driver, driverB: Driver) => {
      const id = generateId(driverA, driverB)
      return favorites.some((c) => c.id === id)
    },
    [favorites]
  )

  return {
    recentComparisons,
    favorites,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
    clearHistory,
    isFavorite,
  }
}
