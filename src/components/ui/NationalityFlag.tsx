import { useState } from 'react'
import { getNationalityFlag, getFlagImageUrl } from '../../lib/nationalityFlags'

type NationalityFlagProps = {
  nationality: string | undefined
  size?: 'sm' | 'md' | 'lg'
  showEmoji?: boolean
  className?: string
}

export function NationalityFlag({
  nationality,
  size = 'md',
  showEmoji = false,
  className = '',
}: NationalityFlagProps) {
  const [imageError, setImageError] = useState(false)

  if (!nationality) return null

  const flag = getNationalityFlag(nationality)
  const flagUrl = getFlagImageUrl(nationality, size)

  // Size classes for the flag image
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-6 h-4',
    lg: 'w-8 h-6',
  }

  // If showEmoji or image failed to load, show emoji
  if (showEmoji || imageError || !flagUrl) {
    return flag ? (
      <span className={`inline-block ${className}`} title={nationality} role="img" aria-label={`${nationality} flag`}>
        {flag}
      </span>
    ) : null
  }

  return (
    <img
      src={flagUrl}
      alt={`${nationality} flag`}
      title={nationality}
      className={`inline-block rounded-sm shadow-sm object-cover ${sizeClasses[size]} ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  )
}

// Combined driver name with flag
type DriverNameWithFlagProps = {
  givenName: string
  familyName: string
  nationality?: string
  flagPosition?: 'before' | 'after'
  showFullName?: boolean
  className?: string
}

export function DriverNameWithFlag({
  givenName,
  familyName,
  nationality,
  flagPosition = 'after',
  showFullName = true,
  className = '',
}: DriverNameWithFlagProps) {
  const name = showFullName ? `${givenName} ${familyName}` : familyName

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {flagPosition === 'before' && <NationalityFlag nationality={nationality} size="sm" />}
      <span>{name}</span>
      {flagPosition === 'after' && <NationalityFlag nationality={nationality} size="sm" />}
    </span>
  )
}
