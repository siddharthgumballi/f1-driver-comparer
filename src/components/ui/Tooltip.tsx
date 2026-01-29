import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowStyles = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-f1-carbon dark:border-t-f1-steel',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-f1-carbon dark:border-b-f1-steel',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-f1-carbon dark:border-l-f1-steel',
  right:
    'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-f1-carbon dark:border-r-f1-steel',
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div tabIndex={0} className="cursor-help outline-none focus:ring-2 focus:ring-accent-cyan/50 rounded">
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionStyles[position]}`}
          >
            <div className="px-3 py-2 bg-f1-carbon dark:bg-f1-steel text-xs text-white rounded-lg shadow-lg border border-white/10 whitespace-nowrap">
              {content}
            </div>
            <div className={`absolute w-0 h-0 ${arrowStyles[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
