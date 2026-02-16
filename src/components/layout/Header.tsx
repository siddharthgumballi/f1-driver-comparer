import { motion } from 'framer-motion'
import { Toggle } from '../ui/Toggle'

type HeaderProps = {
  live: boolean
  onLiveChange: (live: boolean) => void
  darkMode: boolean
  onDarkModeChange: (darkMode: boolean) => void
}

export function Header({ live, onLiveChange, darkMode, onDarkModeChange }: HeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <div>
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-f1-red to-red-400 bg-clip-text text-transparent"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            F1 Driver Comparer
          </motion.h1>
          <motion.p
            className="text-f1-silver dark:text-zinc-400 mt-1 tracking-wide text-sm uppercase"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Compare F1 driver statistics head-to-head
          </motion.p>
        </div>

        <motion.div
          className="flex items-center gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Toggle
            checked={live}
            onChange={onLiveChange}
            label={live ? 'Live Mode' : 'Live Mode'}
            variant="red"
          />
          <Toggle
            checked={darkMode}
            onChange={onDarkModeChange}
            label={darkMode ? 'Dark' : 'Light'}
            variant="default"
          />
        </motion.div>
      </motion.div>

      {/* Red accent line separator */}
      <motion.div
        className="h-[2px] bg-gradient-to-r from-f1-red via-f1-red/60 to-transparent"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
