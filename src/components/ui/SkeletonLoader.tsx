type SkeletonLoaderProps = {
  variant?: 'card' | 'avatar' | 'text' | 'stat' | 'bar'
  className?: string
}

export function SkeletonLoader({ variant = 'text', className = '' }: SkeletonLoaderProps) {
  const baseClass =
    'animate-pulse bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-f1-steel via-f1-carbon to-f1-steel bg-[length:200%_100%] animate-shimmer'

  switch (variant) {
    case 'card':
      return (
        <div className={`rounded-2xl p-6 ${baseClass} ${className}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-zinc-300 dark:bg-f1-carbon" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-zinc-300 dark:bg-f1-carbon rounded w-3/4" />
              <div className="h-4 bg-zinc-300 dark:bg-f1-carbon rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-zinc-300 dark:bg-f1-carbon rounded" />
            ))}
          </div>
        </div>
      )

    case 'avatar':
      return (
        <div
          className={`w-20 h-20 rounded-full ${baseClass} ${className}`}
        />
      )

    case 'stat':
      return (
        <div className={`flex justify-between items-center py-2 ${className}`}>
          <div className={`h-4 w-24 rounded ${baseClass}`} />
          <div className={`h-4 w-12 rounded ${baseClass}`} />
        </div>
      )

    case 'bar':
      return <div className={`h-8 rounded-full ${baseClass} ${className}`} />

    case 'text':
    default:
      return <div className={`h-4 rounded ${baseClass} ${className}`} />
  }
}

export function DriverCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/8 bg-gradient-to-br from-white/90 to-white/70 dark:from-f1-carbon/90 dark:to-f1-black/95 p-6">
      <div className="flex items-center gap-4 mb-6">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-8 w-3/4" />
          <SkeletonLoader className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-1">
        {[...Array(10)].map((_, i) => (
          <SkeletonLoader key={i} variant="stat" />
        ))}
      </div>
    </div>
  )
}
