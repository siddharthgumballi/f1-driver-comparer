import { motion } from 'framer-motion'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  variant?: 'red' | 'default'
  disabled?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  variant = 'default',
  disabled = false,
}: ToggleProps) {
  const activeColor = variant === 'red' ? 'bg-f1-red' : 'bg-accent-cyan'
  const inactiveColor = 'bg-zinc-300 dark:bg-f1-steel'
  const labelActiveColor = variant === 'red' ? 'text-f1-red' : 'text-accent-cyan'

  return (
    <motion.label
      className={`flex items-center gap-3 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          aria-label={label}
        />
        <div
          className={`w-12 h-6 rounded-full shadow-inner transition-all duration-300 ${
            checked ? activeColor : inactiveColor
          }`}
        />
        <motion.div
          className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ x: checked ? 24 : 0 }}
        />
      </div>
      <span
        className={`text-sm font-medium transition-colors ${
          checked ? labelActiveColor : 'text-f1-silver dark:text-zinc-400'
        }`}
      >
        {label}
      </span>
    </motion.label>
  )
}
