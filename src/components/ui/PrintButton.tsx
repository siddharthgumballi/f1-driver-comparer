import { motion } from 'framer-motion'

type PrintButtonProps = {
  onPrint: () => void
}

export function PrintButton({ onPrint }: PrintButtonProps) {
  return (
    <motion.button
      onClick={onPrint}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-f1-carbon border border-f1-steel hover:border-accent-cyan transition-colors text-sm font-medium text-f1-white"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Print comparison"
      title="Print (Ctrl+P)"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
      Print
    </motion.button>
  )
}
