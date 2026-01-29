import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllDrivers } from '../lib/ergast'
import type { Driver } from '../types'

type Props = {
  label: string
  value: Driver | null
  onChange: (d: Driver | null) => void
  disabled?: boolean
}

export default function DriverSelect({ label, value, onChange, disabled = false }: Props) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getAllDrivers()
      .then((list) => {
        if (mounted) setDrivers(list as Driver[])
      })
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const filtered = useMemo(() => {
    if (!q) return drivers
    const s = q.toLowerCase()
    return drivers.filter(
      (d) =>
        `${d.givenName} ${d.familyName}`.toLowerCase().includes(s) ||
        (d.code || '').toLowerCase().includes(s) ||
        (d.nationality || '').toLowerCase().includes(s)
    )
  }, [drivers, q])

  return (
    <div className="w-full" ref={dropdownRef}>
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-f1-silver dark:text-zinc-400 font-mono">
        {label}
      </div>
      <div className="relative">
        <button
          className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
            disabled
              ? 'border-zinc-300 dark:border-f1-steel bg-zinc-100 dark:bg-f1-carbon/50 text-f1-silver cursor-not-allowed'
              : 'border-zinc-300 dark:border-f1-steel bg-white dark:bg-f1-carbon hover:border-accent-cyan dark:hover:border-accent-cyan/50 hover:shadow-glow-cyan cursor-pointer'
          }`}
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {value ? (
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-f1-white">
                {value.givenName} {value.familyName}
              </span>
              <span className="text-xs font-mono text-f1-silver dark:text-zinc-400">
                {(value.code || '').toUpperCase()}{' '}
                {value.permanentNumber ? `#${value.permanentNumber}` : ''}
              </span>
            </div>
          ) : (
            <span className="text-f1-silver dark:text-zinc-500">Select a driver...</span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[100] mt-2 w-full rounded-xl border border-zinc-300 dark:border-f1-steel bg-white dark:bg-f1-carbon shadow-glass-lg overflow-hidden"
            >
              <div className="p-3 border-b border-zinc-200 dark:border-f1-steel">
                <div className="relative">
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={loading ? 'Loading drivers...' : 'Search by name, code, or nationality...'}
                    className="w-full rounded-lg bg-zinc-100 dark:bg-f1-black px-4 py-2.5 text-sm text-zinc-900 dark:text-f1-white placeholder-f1-silver outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all"
                    aria-label="Search drivers"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-f1-silver"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="max-h-72 overflow-auto" role="listbox">
                {filtered.map((d) => (
                  <button
                    key={d.driverId}
                    className="block w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-f1-steel/50 transition-colors border-b border-zinc-100 dark:border-f1-steel/30 last:border-b-0"
                    onClick={() => {
                      onChange(d)
                      setOpen(false)
                      setQ('')
                    }}
                    role="option"
                    aria-selected={value?.driverId === d.driverId}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-900 dark:text-f1-white">
                        {d.givenName} {d.familyName}
                      </span>
                      <span className="text-xs font-mono text-f1-silver dark:text-zinc-400">
                        {(d.code || '').toUpperCase()}{' '}
                        {d.permanentNumber ? `#${d.permanentNumber}` : ''}
                      </span>
                    </div>
                    {d.nationality && (
                      <div className="text-xs text-f1-silver mt-0.5">{d.nationality}</div>
                    )}
                  </button>
                ))}
                {!loading && filtered.length === 0 && (
                  <div className="px-4 py-8 text-sm text-f1-silver text-center">
                    No drivers found
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 dark:border-f1-steel p-2">
                <button
                  className="w-full text-sm text-f1-silver hover:text-accent-cyan transition-colors py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-f1-steel/50"
                  onClick={() => {
                    onChange(null)
                    setOpen(false)
                    setQ('')
                  }}
                >
                  Clear selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
