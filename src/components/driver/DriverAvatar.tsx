import { useState, useEffect, useRef } from 'react'
import type { Driver } from '../../types'
import { getDriverPhotoUrl, fetchLegacyDriverPhoto, shouldUseLegacyPhoto } from '../../lib/driverPhotos'

type DriverAvatarProps = {
  driver: Driver
  accent: 'red' | 'cyan'
  lastSeason?: number | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-12 h-12 text-xs',
  md: 'w-20 h-20 text-lg',
  lg: 'w-28 h-28 text-2xl',
}

export function DriverAvatar({ driver, accent, lastSeason, size = 'md' }: DriverAvatarProps) {
  const preferLegacy = shouldUseLegacyPhoto(lastSeason)
  const [photoUrl, setPhotoUrl] = useState<string | null>(() =>
    preferLegacy ? null : getDriverPhotoUrl(driver)
  )
  const [showInitials, setShowInitials] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    setShowInitials(false)
    if (!preferLegacy) {
      setPhotoUrl(getDriverPhotoUrl(driver))
      return
    }

    let cancelled = false
    fetchLegacyDriverPhoto(driver)
      .then((url) => {
        if (cancelled || !isMounted.current) return
        if (url) setPhotoUrl(url)
        else setShowInitials(true)
      })
      .catch(() => {
        if (!cancelled && isMounted.current) setShowInitials(true)
      })
    return () => {
      cancelled = true
    }
  }, [driver.driverId, driver.givenName, driver.familyName, preferLegacy])

  const initials =
    `${driver.givenName?.[0] ?? ''}${driver.familyName?.[0] ?? ''}`.trim().toUpperCase() || '??'

  const borderColor = accent === 'red' ? 'border-f1-red/30' : 'border-accent-cyan/30'
  const glowClass = accent === 'red' ? 'shadow-glow-red' : 'shadow-glow-cyan'
  const gradient =
    accent === 'red'
      ? 'bg-gradient-to-br from-f1-red/10 via-f1-red/5 to-zinc-200/20 dark:from-f1-red/15 dark:via-f1-red/5 dark:to-f1-carbon/30'
      : 'bg-gradient-to-br from-accent-cyan/10 via-accent-cyan/5 to-zinc-200/20 dark:from-accent-cyan/15 dark:via-accent-cyan/5 dark:to-f1-carbon/30'

  const isWikiPhoto = photoUrl?.includes('upload.wikimedia.org')

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full border-2 ${borderColor} ${gradient} overflow-hidden flex items-center justify-center transition-all duration-300 hover:${glowClass}`}
    >
      {!showInitials && photoUrl ? (
        <img
          src={photoUrl}
          alt={`${driver.givenName} ${driver.familyName}`}
          className="w-full h-full object-cover object-center"
          style={{ objectPosition: isWikiPhoto ? '40% center' : 'center' }}
          onError={() => setShowInitials(true)}
        />
      ) : (
        <span className="font-black tracking-widest text-f1-silver dark:text-zinc-200">
          {initials}
        </span>
      )}
    </div>
  )
}
