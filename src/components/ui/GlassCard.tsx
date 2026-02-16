import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

type GlassCardProps = HTMLMotionProps<'div'> & {
  children: ReactNode
  variant?: 'default' | 'red' | 'cyan'
  hover?: boolean
}

const variantStyles = {
  default: {
    base: 'bg-gradient-to-br from-white/90 to-white/70 dark:from-f1-carbon/90 dark:to-f1-black/95 border-zinc-200/70 dark:border-white/8',
    hover: 'hover:border-zinc-300 dark:hover:border-white/15',
  },
  red: {
    base: 'bg-gradient-to-br from-white/90 to-white/70 dark:from-f1-carbon/90 dark:to-f1-black/95 border-f1-red/20 dark:border-f1-red/20',
    hover: 'hover:border-f1-red/40 hover:shadow-glow-red',
  },
  cyan: {
    base: 'bg-gradient-to-br from-white/90 to-white/70 dark:from-f1-carbon/90 dark:to-f1-black/95 border-accent-cyan/20 dark:border-accent-cyan/20',
    hover: 'hover:border-accent-cyan/40 hover:shadow-glow-cyan',
  },
}

export function GlassCard({
  children,
  variant = 'default',
  hover = true,
  className = '',
  ...props
}: GlassCardProps) {
  const styles = variantStyles[variant]

  return (
    <motion.div
      className={`
        rounded-xl border backdrop-blur-xl shadow-glass
        transition-all duration-300
        ring-1 ring-inset ring-white/[0.06]
        ${styles.base}
        ${hover ? styles.hover : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
