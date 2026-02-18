import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toggle } from '../ui/Toggle'

type WhatIfHeaderProps = {
  darkMode: boolean
  onDarkModeChange: (darkMode: boolean) => void
}

export function WhatIfHeader({ darkMode, onDarkModeChange }: WhatIfHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm text-f1-silver hover:text-accent-cyan transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Comparer
            </Link>
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-accent-gold to-amber-400 bg-clip-text text-transparent"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            What If?
          </motion.h1>
          <motion.p
            className="text-f1-silver dark:text-zinc-400 mt-1 tracking-wide text-sm uppercase"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Recalculate career points under alternate scoring systems
          </motion.p>
        </div>

        <motion.div
          className="flex items-center gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Toggle
            checked={darkMode}
            onChange={onDarkModeChange}
            label={darkMode ? 'Dark' : 'Light'}
            variant="default"
          />
        </motion.div>
      </motion.div>

      {/* Gold accent line separator */}
      <motion.div
        className="h-[2px] bg-gradient-to-r from-accent-gold via-accent-gold/60 to-transparent"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
