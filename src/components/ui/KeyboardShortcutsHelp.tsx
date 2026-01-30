import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KEYBOARD_SHORTCUTS } from '../../hooks/useKeyboardShortcuts'

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for ? key to toggle help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '?' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Help button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-f1-carbon border border-f1-steel hover:border-accent-cyan transition-colors text-sm font-medium text-f1-silver hover:text-f1-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        ?
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal container - flex centering */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              {/* Modal content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-2xl bg-f1-carbon border border-f1-steel shadow-glass-lg overflow-hidden pointer-events-auto"
              >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-f1-steel">
                <h2 className="text-lg font-bold text-f1-white">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-f1-steel/50 transition-colors text-f1-silver hover:text-f1-white"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Shortcuts list */}
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-f1-steel/30 transition-colors"
                  >
                    <span className="text-sm text-f1-silver">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 text-xs font-mono bg-f1-black border border-f1-steel rounded text-f1-white">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-f1-silver mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-f1-steel bg-f1-black/30">
                <p className="text-xs text-f1-silver text-center">
                  Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-f1-carbon border border-f1-steel rounded">?</kbd> to toggle this help
                </p>
              </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
