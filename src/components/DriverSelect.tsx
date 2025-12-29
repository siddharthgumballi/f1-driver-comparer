import { useEffect, useMemo, useState } from 'react'
import { Driver, getAllDrivers } from '../lib/ergast'

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

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getAllDrivers()
      .then(list => {
        if (mounted) setDrivers(list)
      })
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!q) return drivers
    const s = q.toLowerCase()
    return drivers.filter(d =>
      `${d.givenName} ${d.familyName}`.toLowerCase().includes(s) ||
      (d.code || '').toLowerCase().includes(s) ||
      (d.nationality || '').toLowerCase().includes(s)
    )
  }, [drivers, q])

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-zinc-400">{label}</div>
      <div className="relative">
        <button
          className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
            disabled 
              ? 'border-zinc-800 bg-zinc-900/50 text-zinc-500 cursor-not-allowed' 
              : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 cursor-pointer'
          }`}
          onClick={() => !disabled && setOpen(o => !o)}
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center justify-between">
              <span>{value.givenName} {value.familyName}</span>
              <span className="text-xs text-zinc-400">
                {(value.code || '').toUpperCase()} {value.permanentNumber ? `• #${value.permanentNumber}` : ''}
              </span>
            </div>
          ) : (
            <span className="text-zinc-500">Select a driver</span>
          )}
        </button>
        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 shadow-xl">
            <div className="p-2 border-b border-zinc-800">
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={loading ? 'Loading drivers…' : 'Search drivers…'}
                className="w-full rounded-md bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="max-h-72 overflow-auto">
              {filtered.map(d => (
                <button
                  key={d.driverId}
                  className="block w-full px-3 py-2 text-left hover:bg-zinc-800"
                  onClick={() => {
                    onChange(d)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{d.givenName} {d.familyName}</span>
                    <span className="text-xs text-zinc-400">
                      {(d.code || '').toUpperCase()} {d.permanentNumber ? `• #${d.permanentNumber}` : ''}
                    </span>
                  </div>
                </button>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="px-3 py-6 text-sm text-zinc-500">No results</div>
              )}
            </div>
            <div className="border-t border-zinc-800 p-2">
              <button
                className="text-sm text-zinc-400 hover:text-zinc-200"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
