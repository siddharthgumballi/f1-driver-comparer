import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform, useInView } from 'framer-motion'

type AnimatedCounterProps = {
  value: number
  duration?: number
  delay?: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  highlightBetter?: 'higher' | 'lower' | null
  comparisonValue?: number
  animateOnView?: boolean
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  delay = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
  highlightBetter = null,
  comparisonValue,
  animateOnView = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  // Determine if this value is "better"
  const isBetter =
    highlightBetter &&
    comparisonValue !== undefined &&
    (highlightBetter === 'higher' ? value > comparisonValue : value < comparisonValue)

  const isWorse =
    highlightBetter &&
    comparisonValue !== undefined &&
    (highlightBetter === 'higher' ? value < comparisonValue : value > comparisonValue)

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  })

  const display = useTransform(spring, (current) => {
    const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()
    return `${prefix}${formatted}${suffix}`
  })

  useEffect(() => {
    if (animateOnView && !isInView) return
    if (hasAnimated && animateOnView) return

    const timeout = setTimeout(() => {
      spring.set(value)
      setHasAnimated(true)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [value, isInView, animateOnView, delay, spring, hasAnimated])

  // Reset animation when value changes
  useEffect(() => {
    if (!animateOnView) {
      spring.set(0)
      setTimeout(() => spring.set(value), 50)
    }
  }, [value, animateOnView, spring])

  const highlightClass = isBetter
    ? 'text-accent-neon font-bold'
    : isWorse
      ? 'text-f1-silver'
      : ''

  return (
    <span ref={ref} className={`${className} ${highlightClass}`}>
      <motion.span>{display}</motion.span>
      {isBetter && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: duration + delay, duration: 0.3 }}
          className="ml-1 inline-block"
        >
          <svg className="w-3 h-3 inline text-accent-neon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      )}
    </span>
  )
}

// Simpler version for inline stat display
type StatCounterProps = {
  value: number
  label: string
  decimals?: number
  suffix?: string
  highlightBetter?: 'higher' | 'lower' | null
  comparisonValue?: number
}

export function StatCounter({
  value,
  label,
  decimals = 0,
  suffix = '',
  highlightBetter = null,
  comparisonValue,
}: StatCounterProps) {
  const isBetter =
    highlightBetter &&
    comparisonValue !== undefined &&
    (highlightBetter === 'higher' ? value > comparisonValue : value < comparisonValue)

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold tabular-nums ${isBetter ? 'text-accent-neon' : ''}`}>
        <AnimatedCounter
          value={value}
          decimals={decimals}
          suffix={suffix}
          highlightBetter={highlightBetter}
          comparisonValue={comparisonValue}
        />
      </div>
      <div className="text-xs text-f1-silver uppercase tracking-wider">{label}</div>
    </div>
  )
}
