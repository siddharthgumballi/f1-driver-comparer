import { getTeamColor } from '../../lib/teamColors'

type TeamColorBadgeProps = {
  constructorId: string | undefined
  constructorName?: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function TeamColorBadge({
  constructorId,
  constructorName,
  size = 'md',
  showName = true,
  className = '',
}: TeamColorBadgeProps) {
  const colors = getTeamColor(constructorId)

  const sizeClasses = {
    sm: 'h-4 text-xs px-1.5',
    md: 'h-6 text-sm px-2',
    lg: 'h-8 text-base px-3',
  }

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  if (!showName) {
    return (
      <span
        className={`inline-block rounded-full ${dotSizes[size]} ${className}`}
        style={{ backgroundColor: colors.primary }}
        title={constructorName || constructorId}
      />
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: colors.primary,
        color: colors.text,
      }}
    >
      {constructorName || constructorId}
    </span>
  )
}

// Team color strip/accent bar
type TeamColorStripProps = {
  constructorId: string | undefined
  position?: 'top' | 'bottom' | 'left' | 'right'
  thickness?: number
  className?: string
}

export function TeamColorStrip({
  constructorId,
  position = 'left',
  thickness = 4,
  className = '',
}: TeamColorStripProps) {
  const colors = getTeamColor(constructorId)

  const positionStyles = {
    top: { top: 0, left: 0, right: 0, height: thickness },
    bottom: { bottom: 0, left: 0, right: 0, height: thickness },
    left: { top: 0, bottom: 0, left: 0, width: thickness },
    right: { top: 0, bottom: 0, right: 0, width: thickness },
  }

  return (
    <div
      className={`absolute ${className}`}
      style={{
        ...positionStyles[position],
        backgroundColor: colors.primary,
      }}
    />
  )
}

// Team-colored gradient background
type TeamGradientBackgroundProps = {
  constructorId: string | undefined
  opacity?: number
  direction?: 'to-r' | 'to-l' | 'to-b' | 'to-t' | 'to-br' | 'to-bl'
  className?: string
}

export function TeamGradientBackground({
  constructorId,
  opacity = 0.1,
  direction = 'to-r',
  className = '',
}: TeamGradientBackgroundProps) {
  const colors = getTeamColor(constructorId)

  const gradientDirections = {
    'to-r': '90deg',
    'to-l': '270deg',
    'to-b': '180deg',
    'to-t': '0deg',
    'to-br': '135deg',
    'to-bl': '225deg',
  }

  return (
    <div
      className={`absolute inset-0 -z-10 ${className}`}
      style={{
        background: `linear-gradient(${gradientDirections[direction]}, ${colors.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 100%)`,
      }}
    />
  )
}
