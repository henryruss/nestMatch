import { motion } from 'framer-motion'

export default function PartnerBanner({ partnerName, progress }) {
  if (!progress || progress.completedPhotos === 0) return null

  const percentage = Math.round((progress.completedPhotos / progress.totalPhotos) * 100)

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-warm-white/92 backdrop-blur-sm border-b border-sand px-4 py-2.5"
    >
      <div className="flex items-center justify-between text-sm gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-sage flex-shrink-0 animate-pulse" />
          <span className="text-charcoal-light text-xs truncate">
            {progress.isFinished ? (
              <span className="font-medium text-sage-dark">{partnerName} finished!</span>
            ) : (
              <>
                <span className="font-medium text-charcoal">{partnerName}</span>
                {' '}&middot; {progress.currentSubcategory}
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-warm-gray tabular-nums">
            {percentage}%
          </span>
          <div className="w-16 h-1 bg-sand rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-sage rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
