import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export function Layout() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-f1-black text-zinc-900 dark:text-f1-white px-4 md:px-6 lg:px-10 py-6 overflow-hidden">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 -z-10 dot-grid-bg no-print" />

      <motion.div
        className="max-w-[1800px] mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.div>
    </div>
  )
}
