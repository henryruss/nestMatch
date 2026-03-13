import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { ROOM_TYPES } from '../lib/constants'

const ROOM_ICONS = {
  kitchen: '◇',
  'living-room': '○',
  bedroom: '△',
}

const stepVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
}

export default function Landing() {
  const [step, setStep] = useState('hero')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [sessionError, setSessionError] = useState(null)
  const [copied, setCopied] = useState({})
  const navigate = useNavigate()

  const handleCreateSession = async () => {
    if (!name1.trim() || !name2.trim()) return
    setCreating(true)

    const id = uuidv4().slice(0, 8)
    const { error } = await supabase.from('sessions').insert({
      id,
      room_type: selectedRoom,
      player1_name: name1.trim(),
      player2_name: name2.trim(),
      status: 'swiping',
    })

    if (error) {
      console.error('Create session error:', error)
      const errorMsg = error.message || `Could not create session. Make sure you've set up Supabase and run the database schema.`
      setSessionError(errorMsg)
      setCreating(false)
      return
    }

    setSessionId(id)
    setStep('links')
    setCreating(false)
  }

  const getLink = (playerNum) => {
    const base = window.location.origin
    return `${base}/session/${sessionId}/player/${playerNum}`
  }

  const copyLink = (playerNum) => {
    navigator.clipboard.writeText(getLink(playerNum))
    setCopied(prev => ({ ...prev, [playerNum]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [playerNum]: false })), 2000)
  }

  const rooms = Object.entries(ROOM_TYPES)

  return (
    <div className="app-screen flex flex-col bg-cream">
      <AnimatePresence mode="wait">

        {/* ─── Hero ─────────────────────────────────── */}
        {step === 'hero' && (
          <motion.div
            key="hero"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Top decorative section */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 pt-8 pb-4">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="h-px w-10 bg-terracotta/40" />
                <span className="text-xs font-medium tracking-[0.18em] text-terracotta uppercase">
                  Design Together
                </span>
                <div className="h-px w-10 bg-terracotta/40" />
              </motion.div>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
                className="text-center mb-3"
              >
                <h1 className="font-heading text-[4.5rem] leading-none text-charcoal tracking-tight">
                  Nest
                </h1>
                <h1 className="font-heading text-[4.5rem] leading-none text-terracotta italic tracking-tight -mt-2">
                  Match
                </h1>
              </motion.div>

              {/* Divider with ornament */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="h-px flex-1 bg-sand" />
                <span className="text-warm-gray text-xs">&#10022;</span>
                <div className="h-px flex-1 bg-sand" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="font-heading italic text-charcoal-light text-lg text-center leading-relaxed mb-2"
              >
                Swipe. Match. Dream together.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                className="text-warm-gray-dark text-sm text-center leading-relaxed max-w-xs"
              >
                Both of you swipe through interior photos independently,
                then see your shared taste come to life.
              </motion.p>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-6 pb-10"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep('room')}
                className="w-full bg-charcoal hover:bg-charcoal-light text-cream font-medium text-base py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-charcoal/15"
              >
                <span>Begin</span>
                <span className="text-terracotta-light">&#8594;</span>
              </motion.button>

              <p className="text-center text-xs text-warm-gray mt-4">
                Free &middot; No account needed &middot; 5 minutes
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* ─── Room Selection ───────────────────────── */}
        {step === 'room' && (
          <motion.div
            key="room"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="app-screen flex flex-col px-6 py-8"
          >
            <div className="mb-8">
              <p className="text-xs tracking-[0.18em] text-terracotta uppercase font-medium mb-3">
                Step 1 of 3
              </p>
              <h2 className="font-heading text-3xl text-charcoal leading-tight mb-2">
                Which room are<br />
                <em>you designing?</em>
              </h2>
              <p className="text-warm-gray-dark text-sm">
                Choose a space to find your shared style.
              </p>
            </div>

            <div className="space-y-3 flex-1">
              {rooms.map(([key, room], i) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedRoom(key)
                    setStep('names')
                  }}
                  className="w-full bg-warm-white hover:bg-sand border border-sand hover:border-terracotta/30 rounded-2xl p-5 text-left transition-all group flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-sand/60 group-hover:bg-terracotta/10 flex items-center justify-center transition-colors flex-shrink-0">
                    <span className="text-terracotta text-lg font-heading">{ROOM_ICONS[key]}</span>
                  </div>
                  <div>
                    <span className="font-heading text-xl text-charcoal group-hover:text-terracotta transition-colors block">
                      {room.label}
                    </span>
                    <span className="text-xs text-warm-gray-dark">
                      {room.subcategories.length} categories
                    </span>
                  </div>
                  <span className="ml-auto text-warm-gray group-hover:text-terracotta transition-colors text-lg">
                    &#8594;
                  </span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStep('hero')}
              className="text-warm-gray-dark hover:text-charcoal text-sm transition-colors mt-6 flex items-center gap-2 mx-auto"
            >
              <span className="text-xs">&#8592;</span> Back
            </button>
          </motion.div>
        )}

        {/* ─── Names ────────────────────────────────── */}
        {step === 'names' && (
          <motion.div
            key="names"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="app-screen flex flex-col px-6 py-8"
          >
            <div className="mb-8">
              <p className="text-xs tracking-[0.18em] text-terracotta uppercase font-medium mb-3">
                Step 2 of 3
              </p>
              <h2 className="font-heading text-3xl text-charcoal leading-tight mb-2">
                Who's playing<br />
                <em>together?</em>
              </h2>
              <p className="text-warm-gray-dark text-sm">
                We'll create a private link for each of you.
              </p>
            </div>

            <div className="space-y-5 flex-1">
              {[
                { label: 'First person', value: name1, set: setName1, placeholder: 'e.g. Jake' },
                { label: 'Second person', value: name2, set: setName2, placeholder: 'e.g. Sarah' },
              ].map(({ label, value, set, placeholder }, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium tracking-wide text-warm-gray-dark mb-2 uppercase">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3.5 rounded-xl border border-sand bg-warm-white text-charcoal placeholder:text-warm-gray focus:outline-none focus:ring-2 focus:ring-terracotta/25 focus:border-terracotta transition text-base"
                    maxLength={20}
                  />
                </div>
              ))}

              {sessionError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm leading-relaxed"
                >
                  {sessionError}
                </motion.div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateSession}
                disabled={!name1.trim() || !name2.trim() || creating}
                className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-medium text-base py-4 rounded-2xl shadow-md shadow-terracotta/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Session'
                )}
              </motion.button>

              <button
                onClick={() => {
                  setSessionError(null)
                  setStep('room')
                }}
                className="text-warm-gray-dark hover:text-charcoal text-sm transition-colors flex items-center gap-2 mx-auto"
              >
                <span className="text-xs">&#8592;</span> Back
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── Links ────────────────────────────────── */}
        {step === 'links' && (
          <motion.div
            key="links"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="app-screen flex flex-col px-6 py-8"
          >
            <div className="mb-8">
              <p className="text-xs tracking-[0.18em] text-sage-dark uppercase font-medium mb-3">
                Step 3 of 3 &mdash; Ready!
              </p>
              <h2 className="font-heading text-3xl text-charcoal leading-tight mb-2">
                Share your<br />
                <em>private links</em>
              </h2>
              <p className="text-warm-gray-dark text-sm">
                Don't peek at each other's answers &mdash; swipe independently!
              </p>
            </div>

            <div className="space-y-4 flex-1">
              {[1, 2].map((num, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-warm-white border border-sand rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-terracotta/10 flex items-center justify-center">
                        <span className="text-terracotta text-xs font-semibold">{num}</span>
                      </div>
                      <span className="font-medium text-charcoal text-sm">
                        {num === 1 ? name1 : name2}
                      </span>
                    </div>
                    <span className="text-xs text-warm-gray bg-sand px-2 py-0.5 rounded-full">
                      Player {num}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 rounded-lg bg-cream border border-sand text-xs text-charcoal-light truncate font-mono">
                      {getLink(num)}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => copyLink(num)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex-shrink-0 ${
                        copied[num]
                          ? 'bg-sage text-white'
                          : 'bg-charcoal hover:bg-charcoal-light text-white'
                      }`}
                    >
                      {copied[num] ? 'Copied!' : 'Copy'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-terracotta/6 border border-terracotta/15 rounded-xl p-3 flex gap-2"
              >
                <span className="text-terracotta mt-0.5 flex-shrink-0">&#9432;</span>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  Send the second link to your partner. Each person opens their own link on their own device.
                </p>
              </motion.div>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/session/${sessionId}/player/1`)}
              className="mt-6 w-full bg-terracotta hover:bg-terracotta-dark text-white font-medium py-4 rounded-2xl shadow-md shadow-terracotta/20 transition-colors"
            >
              Open {name1}'s Link
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
