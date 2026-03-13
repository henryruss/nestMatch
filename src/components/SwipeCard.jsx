import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

export default function SwipeCard({ photo, onSwipe, subcategoryLabel, current, total, subcategoryIndex, totalSubcategories }) {
  const [exiting, setExiting] = useState(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0.4, 0.85, 1, 0.85, 0.4])
  const yesOpacity = useTransform(x, [20, 110], [0, 1])
  const noOpacity = useTransform(x, [-110, -20], [1, 0])

  const handleSwipe = (decision) => {
    setExiting(decision)
    setTimeout(() => {
      onSwipe(decision)
      setExiting(null)
    }, 320)
  }

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 90) handleSwipe('yes')
    else if (info.offset.x < -90) handleSwipe('no')
  }

  const progressPercent = ((subcategoryIndex - 1) * 10 + current) / (totalSubcategories * 10) * 100

  return (
    <div className="flex flex-col items-center w-full px-4">
      {/* Progress header */}
      <div className="w-full mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-charcoal tracking-wide">
            {subcategoryLabel}
          </span>
          <span className="text-xs text-warm-gray tabular-nums">
            {subcategoryIndex}/{totalSubcategories}
          </span>
        </div>
        <div className="w-full h-0.5 bg-sand rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-terracotta rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-warm-gray-dark">
            Photo {current} of {total}
          </span>
          <span className="text-xs text-warm-gray-dark tabular-nums">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full mb-5" style={{ aspectRatio: '3/4', maxHeight: '440px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.75}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: exiting === 'yes' ? 340 : exiting === 'no' ? -340 : 0,
            }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl shadow-charcoal/15">
              <img
                src={photo.url}
                alt={photo.description}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Gradient base for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent pointer-events-none" />

              {/* YES overlay */}
              <motion.div
                style={{ opacity: yesOpacity }}
                className="absolute inset-0 bg-gradient-to-br from-sage/30 to-transparent flex items-start justify-end p-5 pointer-events-none"
              >
                <div className="border-2 border-sage bg-sage/20 backdrop-blur-sm rounded-xl px-4 py-1.5 rotate-[-8deg]">
                  <span className="font-heading font-bold text-white text-xl tracking-wide drop-shadow">
                    LOVE IT
                  </span>
                </div>
              </motion.div>

              {/* NO overlay */}
              <motion.div
                style={{ opacity: noOpacity }}
                className="absolute inset-0 bg-gradient-to-bl from-warm-gray/30 to-transparent flex items-start justify-start p-5 pointer-events-none"
              >
                <div className="border-2 border-warm-gray bg-charcoal/20 backdrop-blur-sm rounded-xl px-4 py-1.5 rotate-[8deg]">
                  <span className="font-heading font-bold text-white text-xl tracking-wide drop-shadow">
                    NOPE
                  </span>
                </div>
              </motion.div>

              {/* Photo credit */}
              <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                <p className="text-white/55 text-xs">
                  {photo.photographer}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 w-full">
        <motion.button
          whileHover={{ scale: 1.06, backgroundColor: '#D1CBC4' }}
          whileTap={{ scale: 0.93 }}
          onClick={() => handleSwipe('no')}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-sand border border-sand/0 text-charcoal-light shadow-sm transition-colors"
          aria-label="No"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.button>

        <div className="text-center">
          <p className="text-xs text-warm-gray leading-none">drag or tap</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.06, backgroundColor: '#6E8E6B' }}
          whileTap={{ scale: 0.93 }}
          onClick={() => handleSwipe('yes')}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-sage text-white shadow-md shadow-sage/25 transition-colors"
          aria-label="Yes"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
