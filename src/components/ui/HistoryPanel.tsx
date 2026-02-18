import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Driver } from '../../types'

type Comparison = {
  id: string
  driverA: Driver
  driverB: Driver
  timestamp: number
}

type HistoryPanelProps = {
  recentComparisons: Comparison[]
  favorites: Comparison[]
  onSelectComparison: (driverA: Driver, driverB: Driver) => void
  onAddToFavorites: (driverA: Driver, driverB: Driver) => void
  onRemoveFromFavorites: (id: string) => void
  onClearHistory: () => void
  isFavorite: (driverA: Driver, driverB: Driver) => boolean
}

export function HistoryPanel({
  recentComparisons,
  favorites,
  onSelectComparison,
  onAddToFavorites,
  onRemoveFromFavorites,
  onClearHistory,
  isFavorite,
}: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent')

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const hasItems = recentComparisons.length > 0 || favorites.length > 0

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-f1-carbon border border-f1-steel hover:border-accent-cyan transition-colors text-sm font-medium text-f1-white"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="View history and favorites"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        History
        {hasItems && (
          <span className="w-2 h-2 rounded-full bg-accent-cyan" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-f1-carbon border border-f1-steel shadow-glass-lg z-50 overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex border-b border-f1-steel">
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'recent'
                      ? 'text-accent-cyan border-b-2 border-accent-cyan'
                      : 'text-f1-silver hover:text-f1-white'
                  }`}
                >
                  Recent ({recentComparisons.length})
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'favorites'
                      ? 'text-accent-gold border-b-2 border-accent-gold'
                      : 'text-f1-silver hover:text-f1-white'
                  }`}
                >
                  Favorites ({favorites.length})
                </button>
              </div>

              {/* Content */}
              <div className="max-h-80 overflow-y-auto">
                {activeTab === 'recent' && (
                  <>
                    {recentComparisons.length === 0 ? (
                      <div className="p-6 text-center text-f1-silver text-sm">
                        No recent comparisons
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {recentComparisons.map((comparison) => (
                          <ComparisonItem
                            key={comparison.id}
                            comparison={comparison}
                            onSelect={() =>
                              onSelectComparison(comparison.driverA, comparison.driverB)
                            }
                            onToggleFavorite={() =>
                              isFavorite(comparison.driverA, comparison.driverB)
                                ? onRemoveFromFavorites(comparison.id)
                                : onAddToFavorites(comparison.driverA, comparison.driverB)
                            }
                            isFavorite={isFavorite(comparison.driverA, comparison.driverB)}
                            timeLabel={formatTime(comparison.timestamp)}
                            setIsOpen={setIsOpen}
                          />
                        ))}
                      </div>
                    )}
                    {recentComparisons.length > 0 && (
                      <div className="p-2 border-t border-f1-steel">
                        <button
                          onClick={() => {
                            onClearHistory()
                          }}
                          className="w-full px-3 py-2 text-sm text-f1-silver hover:text-f1-red transition-colors rounded-lg hover:bg-f1-steel/30"
                        >
                          Clear History
                        </button>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'favorites' && (
                  <>
                    {favorites.length === 0 ? (
                      <div className="p-6 text-center text-f1-silver text-sm">
                        No favorites yet. Click the star on any comparison to save it.
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {favorites.map((comparison) => (
                          <ComparisonItem
                            key={comparison.id}
                            comparison={comparison}
                            onSelect={() =>
                              onSelectComparison(comparison.driverA, comparison.driverB)
                            }
                            onToggleFavorite={() => onRemoveFromFavorites(comparison.id)}
                            isFavorite={true}
                            setIsOpen={setIsOpen}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

type ComparisonItemProps = {
  comparison: Comparison
  onSelect: () => void
  onToggleFavorite: () => void
  isFavorite: boolean
  timeLabel?: string
  setIsOpen: (open: boolean) => void
}

function ComparisonItem({
  comparison,
  onSelect,
  onToggleFavorite,
  isFavorite,
  timeLabel,
  setIsOpen,
}: ComparisonItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-f1-steel/30 transition-colors group">
      <button
        onClick={() => {
          onSelect()
          setIsOpen(false)
        }}
        className="flex-1 text-left"
      >
        <div className="text-sm font-medium text-f1-white">
          <span className="text-f1-red">{comparison.driverA.familyName}</span>
          <span className="text-f1-silver mx-2">vs</span>
          <span className="text-accent-cyan">{comparison.driverB.familyName}</span>
        </div>
        {timeLabel && (
          <div className="text-xs text-f1-silver mt-0.5">{timeLabel}</div>
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        className={`p-1.5 rounded-lg transition-colors ${
          isFavorite
            ? 'text-accent-gold'
            : 'text-f1-steel hover:text-accent-gold opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className="w-4 h-4"
          fill={isFavorite ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>
    </div>
  )
}
