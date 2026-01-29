import { motion } from 'framer-motion'

type F1CarLoaderProps = {
  variant?: 'red' | 'cyan'
  message?: string
}

export function F1CarLoader({ variant = 'red', message = 'Loading...' }: F1CarLoaderProps) {
  const color = variant === 'red' ? 'bg-f1-red' : 'bg-accent-cyan'
  const colorLight = variant === 'red' ? 'bg-red-500' : 'bg-cyan-400'
  const colorDark = variant === 'red' ? 'bg-f1-darkRed' : 'bg-accent-cyanDark'
  const trailColor = variant === 'red' ? 'bg-red-400' : 'bg-cyan-400'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-8">
        {/* Track */}
        <div className="absolute inset-0 bg-zinc-200 dark:bg-f1-steel rounded-full" />
        <div className="absolute inset-1 bg-zinc-100 dark:bg-f1-carbon rounded-full" />

        {/* F1 Car */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 left-0 w-16 h-2.5"
          animate={{ x: [0, 64] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="relative w-full h-full">
            {/* Main chassis */}
            <div className={`absolute inset-0 ${color} rounded-l-full rounded-r-sm transform scale-y-50`} />

            {/* Nose cone */}
            <div className={`absolute top-1/2 -translate-y-1/2 -left-8 w-9 h-0.5 ${colorDark} rounded-r-full`} />

            {/* Front wing */}
            <div className={`absolute -top-0.5 left-0 w-10 h-0.5 ${colorDark} rounded-sm`} />
            <div className={`absolute -top-1 left-1 w-8 h-0.5 ${color} rounded-sm`} />
            <div className={`absolute -top-1.5 left-2 w-6 h-0.5 ${colorLight} rounded-sm`} />

            {/* Cockpit */}
            <div className="absolute top-0 left-6 w-1.5 h-0.5 bg-zinc-900 rounded-t-sm" />

            {/* Halo */}
            <div className="absolute -top-1.5 left-6 w-2 h-0.5 bg-zinc-700 rounded-sm opacity-80" />

            {/* Side pods */}
            <div className={`absolute top-0.5 left-4 w-10 h-1 ${colorLight} rounded-sm opacity-90`} />

            {/* Engine cover */}
            <div className={`absolute top-0.5 right-3 w-5 h-1 ${color} rounded-r-sm`} />

            {/* Rear wing */}
            <div className={`absolute -top-2.5 right-0 w-0.5 h-6 ${colorDark} rounded-sm`} />
            <div className={`absolute -top-2 right-0.5 w-4 h-0.5 ${color} rounded-sm`} />
            <div className={`absolute -top-3 right-0.5 w-3.5 h-0.5 ${colorLight} rounded-sm`} />
            <div className={`absolute top-2 right-0 w-0.5 h-2.5 ${colorDark} rounded-sm`} />
            <div className={`absolute top-2.5 right-0.5 w-4 h-0.5 ${color} rounded-sm`} />

            {/* Wheels */}
            <div className="absolute bottom-0 left-1 w-3 h-3 bg-zinc-900 rounded-full" />
            <div className="absolute bottom-0 right-1 w-3 h-3 bg-zinc-900 rounded-full" />
            <div className="absolute bottom-0 left-1.5 w-2 h-2 bg-f1-steel rounded-full" />
            <div className="absolute bottom-0 right-1.5 w-2 h-2 bg-f1-steel rounded-full" />
          </div>

          {/* Motion blur trail */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -left-12 w-16 h-2.5 opacity-15"
            animate={{ opacity: [0, 0.15, 0], width: [16, 32, 16] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className={`w-full h-full ${trailColor} rounded-l-full rounded-r-sm transform scale-y-50 opacity-50`} />
          </motion.div>
        </motion.div>

        {/* Track markings */}
        {[4, 12, 20, 28].map((left) => (
          <div
            key={left}
            className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-zinc-400 rounded-full opacity-50"
            style={{ left: `${left}px` }}
          />
        ))}
      </div>
      <p className="text-sm text-f1-silver dark:text-zinc-400">{message}</p>
    </div>
  )
}
