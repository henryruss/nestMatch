import { motion } from 'framer-motion'

export default function EloComparison({ photo1, photo2, onChoose, current, total }) {
  return (
    <div className="flex flex-col items-center w-full px-4 py-4">
      {/* Header */}
      <div className="text-center mb-5 w-full">
        <p className="text-xs tracking-[0.18em] text-terracotta uppercase font-medium mb-1">
          Ranking
        </p>
        <h2 className="font-heading text-2xl text-charcoal mb-3">
          Which do you prefer?
        </h2>

        {/* Progress */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-32 h-1 bg-sand rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-terracotta rounded-full"
              animate={{ width: `${(current / total) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-xs text-warm-gray tabular-nums">
            {current}/{total}
          </span>
        </div>
      </div>

      {/* Photo comparison */}
      <div className="relative w-full flex gap-2.5 items-stretch">
        {[photo1, photo2].map((photo, i) => (
          <motion.button
            key={photo.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.015, zIndex: 10 }}
            whileTap={{ scale: 0.975 }}
            onClick={() => onChoose(photo.id, (i === 0 ? photo2 : photo1).id)}
            className="relative flex-1 rounded-2xl overflow-hidden shadow-md group cursor-pointer focus:outline-none"
            style={{ aspectRatio: '3/4' }}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/12 transition-colors duration-200" />

            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl py-1.5 text-center">
                <span className="text-charcoal text-xs font-semibold tracking-wide">
                  Choose this
                </span>
              </div>
            </div>
          </motion.button>
        ))}

        {/* VS badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-8 h-8 rounded-full bg-cream border border-sand shadow-sm flex items-center justify-center">
            <span className="font-heading text-xs font-bold text-charcoal-light italic">vs</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-warm-gray mt-4 text-center">
        Tap the photo you prefer
      </p>
    </div>
  )
}
