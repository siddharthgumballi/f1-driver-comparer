import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Toggle } from '../ui/Toggle'

type HeaderProps = {
  live: boolean
  onLiveChange: (live: boolean) => void
  darkMode: boolean
  onDarkModeChange: (darkMode: boolean) => void
}

export function Header({ live, onLiveChange, darkMode, onDarkModeChange }: HeaderProps) {
  const location = useLocation()

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

          {/* Nav Links */}
          <motion.nav
            className="flex gap-2 mt-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Link
              to="/"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-f1-red/15 border-f1-red/50 text-f1-red shadow-glow-red'
                  : 'bg-zinc-100 dark:bg-f1-carbon border-zinc-300 dark:border-f1-steel text-f1-silver hover:border-f1-red/30 hover:text-f1-red'
              }`}
            >
              Comparer
            </Link>
            <Link
              to="/what-if"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                location.pathname === '/what-if'
                  ? 'bg-accent-gold/15 border-accent-gold/50 text-accent-gold shadow-glow-gold'
                  : 'bg-zinc-100 dark:bg-f1-carbon border-zinc-300 dark:border-f1-steel text-f1-silver hover:border-accent-gold/30 hover:text-accent-gold'
              }`}
            >
              What If?
            </Link>
          </motion.nav>
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
