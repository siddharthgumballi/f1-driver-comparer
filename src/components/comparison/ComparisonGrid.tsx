import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

type ComparisonGridProps = {
  children: ReactNode
  keyPrefix?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 10,
    },
  },
}

export function ComparisonGrid({ children, keyPrefix }: ComparisonGridProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={keyPrefix}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function ComparisonGridItem({ children }: { children: ReactNode }) {
  return (
    <motion.div className="space-y-4" variants={itemVariants}>
      {children}
    </motion.div>
  )
}
