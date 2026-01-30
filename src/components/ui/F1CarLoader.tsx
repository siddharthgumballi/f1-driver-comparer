import { motion } from 'framer-motion'

type F1CarLoaderProps = {
  variant?: 'red' | 'cyan'
  message?: string
}

export function F1CarLoader({ variant = 'red', message = 'Loading...' }: F1CarLoaderProps) {
  const primaryColor = variant === 'red' ? '#E10600' : '#00D4FF'
  const secondaryColor = variant === 'red' ? '#8B0000' : '#006994'
  const accentColor = variant === 'red' ? '#FF6B6B' : '#7DF9FF'

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Track with car */}
      <div className="relative w-80 h-24 overflow-hidden">
        {/* Animated F1 Car */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          animate={{ x: [-100, 320] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* F1 Car SVG - Side Profile */}
          <svg
            width="100"
            height="40"
            viewBox="0 0 200 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shadow */}
            <ellipse cx="100" cy="75" rx="70" ry="4" fill="rgba(0,0,0,0.3)" />

            {/* Rear wheel */}
            <circle cx="155" cy="58" r="16" fill="#1a1a1a" />
            <circle cx="155" cy="58" r="14" fill="#2a2a2a" />
            <circle cx="155" cy="58" r="10" fill="#1a1a1a" />
            <circle cx="155" cy="58" r="6" fill="#444" />
            {/* Wheel spokes */}
            <line x1="155" y1="44" x2="155" y2="72" stroke="#333" strokeWidth="2" />
            <line x1="141" y1="58" x2="169" y2="58" stroke="#333" strokeWidth="2" />

            {/* Front wheel */}
            <circle cx="45" cy="58" r="14" fill="#1a1a1a" />
            <circle cx="45" cy="58" r="12" fill="#2a2a2a" />
            <circle cx="45" cy="58" r="8" fill="#1a1a1a" />
            <circle cx="45" cy="58" r="5" fill="#444" />
            {/* Wheel spokes */}
            <line x1="45" y1="46" x2="45" y2="70" stroke="#333" strokeWidth="2" />
            <line x1="33" y1="58" x2="57" y2="58" stroke="#333" strokeWidth="2" />

            {/* Floor/Undertray */}
            <path
              d="M30 60 L170 60 L175 55 L25 55 Z"
              fill="#1a1a1a"
            />

            {/* Main body */}
            <path
              d="M25 55
                 L15 52
                 L5 50
                 L5 48
                 L25 45
                 L40 42
                 L55 38
                 L70 32
                 L85 28
                 L95 26
                 L100 26
                 L105 28
                 L110 35
                 L120 38
                 L140 40
                 L160 42
                 L175 44
                 L180 46
                 L180 50
                 L175 55
                 L25 55 Z"
              fill={primaryColor}
            />

            {/* Sidepod */}
            <path
              d="M70 50 L70 38 L120 42 L140 44 L140 52 Z"
              fill={secondaryColor}
            />

            {/* Engine cover */}
            <path
              d="M110 35 L145 40 L170 44 L175 48 L140 46 L115 42 Z"
              fill={secondaryColor}
            />

            {/* Cockpit opening */}
            <path
              d="M85 32 L95 28 L105 30 L108 38 L100 42 L88 40 Z"
              fill="#0a0a0a"
            />

            {/* Halo */}
            <path
              d="M88 35 Q95 22 108 35"
              stroke="#666"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M88 35 Q95 22 108 35"
              stroke="#888"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Driver helmet */}
            <ellipse cx="97" cy="34" rx="6" ry="5" fill={accentColor} />
            <ellipse cx="97" cy="33" rx="4" ry="3" fill="#333" />

            {/* Air intake above driver */}
            <path
              d="M100 26 L105 26 L108 30 L102 30 Z"
              fill="#1a1a1a"
            />

            {/* Front wing */}
            <rect x="2" y="52" width="25" height="3" rx="1" fill={primaryColor} />
            <rect x="0" y="50" width="8" height="8" rx="1" fill={secondaryColor} />
            <path d="M2 58 L20 56 L20 60 L2 62 Z" fill={primaryColor} />

            {/* Front wing endplate */}
            <rect x="0" y="48" width="3" height="16" rx="1" fill={accentColor} />

            {/* Rear wing */}
            <rect x="172" y="20" width="22" height="4" rx="1" fill={primaryColor} />
            <rect x="174" y="26" width="18" height="3" rx="1" fill={secondaryColor} />

            {/* Rear wing endplate */}
            <path
              d="M172 18 L172 45 L176 45 L176 18 Z"
              fill={secondaryColor}
            />
            <path
              d="M192 18 L192 45 L196 45 L196 18 Z"
              fill={secondaryColor}
            />

            {/* Rear wing pillar */}
            <rect x="178" y="32" width="3" height="18" fill="#333" />

            {/* Nose tip */}
            <path
              d="M5 48 L0 49 L0 51 L5 50 Z"
              fill={accentColor}
            />

            {/* Bargeboard/sidepod detail */}
            <path
              d="M55 48 L60 40 L65 40 L60 50 Z"
              fill={accentColor}
              opacity="0.8"
            />

            {/* Exhaust */}
            <ellipse cx="175" cy="48" rx="3" ry="2" fill="#333" />

            {/* Racing number circle */}
            <circle cx="130" cy="46" r="6" fill="white" />
            <text x="130" y="49" fontSize="8" fill="#333" textAnchor="middle" fontWeight="bold">1</text>

            {/* Sponsor stripe detail */}
            <rect x="60" y="44" width="50" height="2" fill="white" opacity="0.6" />
          </svg>

          {/* Motion blur / speed lines */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -left-8 flex flex-col gap-1"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full"
                style={{
                  width: `${20 + Math.random() * 20}px`,
                  backgroundColor: primaryColor,
                  opacity: 0.3 + Math.random() * 0.3,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Track surface */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-zinc-800 dark:bg-zinc-900">
          {/* Track line */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-zinc-600 dark:bg-zinc-700" />
        </div>
      </div>

      {/* Loading text */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-f1-silver dark:text-zinc-400 font-medium">{message}</span>
        <motion.div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
