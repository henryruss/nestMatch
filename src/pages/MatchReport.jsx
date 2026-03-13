import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import { supabase } from '../lib/supabase'
import { useSession } from '../hooks/useSession'
import { ROOM_TYPES } from '../lib/constants'
import { getCoupleSummary, getDreamRoom } from '../lib/api'

export default function MatchReport() {
  const { sessionId } = useParams()
  const { session } = useSession(sessionId)
  const shareCardRef = useRef(null)

  const [phase, setPhase] = useState('reveal') // reveal, report
  const [coupleSummary, setCoupleSummary] = useState('')
  const [dreamNarrative, setDreamNarrative] = useState('')
  const [topPhotos, setTopPhotos] = useState([])
  const [topTags, setTopTags] = useState([])
  const [worthALook, setWorthALook] = useState({ player1: null, player2: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    async function buildReport() {
      // Fetch all swipes
      const { data: allSwipes } = await supabase
        .from('swipes')
        .select('*')
        .eq('session_id', sessionId)

      if (!allSwipes) return

      const p1Yes = allSwipes.filter(s => s.player_number === 1 && s.decision === 'yes')
      const p2Yes = allSwipes.filter(s => s.player_number === 2 && s.decision === 'yes')
      const p1YesIds = new Set(p1Yes.map(s => s.photo_id))
      const p2YesIds = new Set(p2Yes.map(s => s.photo_id))

      // Tag counts per player
      const tags1 = {}
      const tags2 = {}
      for (const s of p1Yes) {
        for (const tag of (s.tags || [])) {
          tags1[tag] = (tags1[tag] || 0) + 1
        }
      }
      for (const s of p2Yes) {
        for (const tag of (s.tags || [])) {
          tags2[tag] = (tags2[tag] || 0) + 1
        }
      }

      // Combined top tags
      const combinedTags = {}
      for (const [tag, count] of Object.entries(tags1)) {
        combinedTags[tag] = (combinedTags[tag] || 0) + count
      }
      for (const [tag, count] of Object.entries(tags2)) {
        combinedTags[tag] = (combinedTags[tag] || 0) + count
      }
      const sortedTags = Object.entries(combinedTags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag)
      setTopTags(sortedTags)

      // Get top photos by ELO or by shared yes count
      const { data: scores } = await supabase
        .from('photo_scores')
        .select('*')
        .eq('session_id', sessionId)
        .order('combined_elo', { ascending: false })
        .limit(4)

      const photoMap = {}
      for (const s of allSwipes) {
        photoMap[s.photo_id] = { id: s.photo_id, url: s.photo_url, tags: s.tags }
      }

      if (scores && scores.length > 0) {
        setTopPhotos(scores.map(s => photoMap[s.photo_id]).filter(Boolean))
      } else {
        // Fallback: shared yes photos
        const shared = [...p1YesIds].filter(id => p2YesIds.has(id))
        setTopPhotos(shared.slice(0, 4).map(id => photoMap[id]).filter(Boolean))
      }

      // "Worth a second look" — player 1's top pick that player 2 skipped, and vice versa
      const p1Unique = p1Yes.filter(s => !p2YesIds.has(s.photo_id))
      const p2Unique = p2Yes.filter(s => !p1YesIds.has(s.photo_id))

      setWorthALook({
        player1: p1Unique.length > 0 ? { url: p1Unique[0].photo_url, id: p1Unique[0].photo_id } : null,
        player2: p2Unique.length > 0 ? { url: p2Unique[0].photo_url, id: p2Unique[0].photo_id } : null,
      })

      // Get Claude narratives
      const roomLabel = ROOM_TYPES[session.room_type]?.label || 'room'

      const [summaryResult, narrativeResult] = await Promise.all([
        getCoupleSummary(session.player1_name, session.player2_name, tags1, tags2, roomLabel),
        getDreamRoom(session.player1_name, session.player2_name, sortedTags, roomLabel),
      ])

      setCoupleSummary(summaryResult)
      setDreamNarrative(narrativeResult)
      setLoading(false)
    }

    buildReport()
  }, [session?.id])

  // Reveal sequence
  useEffect(() => {
    if (!loading && phase === 'reveal') {
      const timer = setTimeout(() => setPhase('report'), 3000)
      return () => clearTimeout(timer)
    }
  }, [loading, phase])

  const handleShare = async () => {
    if (!shareCardRef.current) return
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#FDF8F0',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `nestmatch-${session.player1_name}-${session.player2_name}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (err) {
      console.error('Share card error:', err)
    }
  }

  const formatTag = (tag) => tag.replace(/-/g, ' ')
  const roomLabel = session ? (ROOM_TYPES[session.room_type]?.label || 'Room') : 'Room'

  if (!session || loading) {
    return (
      <div className="app-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-warm-gray-dark font-heading italic text-lg">
            Crafting your dream room...
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'reveal') {
    return (
      <motion.div
        className="app-screen bg-gradient-to-br from-cream via-sand to-blush flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 justify-center mb-6">
              <div className="h-px w-8 bg-terracotta/40" />
              <span className="text-xs tracking-[0.18em] text-terracotta uppercase">Reveal</span>
              <div className="h-px w-8 bg-terracotta/40" />
            </div>
            <h1 className="font-heading text-4xl text-charcoal mb-1 leading-tight">
              {session.player1_name} &amp; {session.player2_name}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-heading text-2xl text-terracotta italic"
            >
              Dream {roomLabel}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="pb-12"
    >
      {/* Header band */}
      <div className="bg-gradient-to-b from-sand/60 to-cream pt-8 pb-6 text-center px-5 border-b border-sand/50">
        <p className="text-xs tracking-[0.18em] text-terracotta uppercase font-medium mb-2">
          Your Results
        </p>
        <h1 className="font-heading text-3xl text-charcoal leading-tight mb-0.5">
          {session.player1_name} &amp; {session.player2_name}
        </h1>
        <p className="font-heading text-lg text-terracotta italic">
          Dream {roomLabel}
        </p>
      </div>

      <div className="px-5 space-y-7 pt-6">

        {/* Mood Board — top of report for visual impact */}
        {topPhotos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-lg text-charcoal">Mood Board</h3>
              <div className="h-px flex-1 bg-sand mx-3" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
              {topPhotos.map((photo, i) => (
                <motion.div
                  key={photo?.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`${i === 0 && topPhotos.length === 3 ? 'row-span-2' : ''} aspect-square`}
                >
                  <img src={photo?.url} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Style DNA tags */}
        {topTags.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center mb-3">
              <h3 className="font-heading text-lg text-charcoal">Style DNA</h3>
              <div className="h-px flex-1 bg-sand ml-3" />
            </div>
            <div className="flex flex-wrap gap-2">
              {topTags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="bg-warm-white border border-sand text-charcoal-light px-3.5 py-1.5 rounded-full text-sm"
                >
                  {formatTag(tag)}
                </motion.span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Shared Aesthetic */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center mb-3">
            <h3 className="font-heading text-lg text-charcoal">Your Shared Aesthetic</h3>
            <div className="h-px flex-1 bg-sand ml-3" />
          </div>
          <div className="bg-warm-white border border-sand rounded-2xl p-5">
            <p className="text-charcoal leading-relaxed text-sm">{coupleSummary}</p>
          </div>
        </motion.section>

        {/* Dream Room Narrative */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center mb-3">
            <h3 className="font-heading text-lg text-charcoal">Your Dream Room</h3>
            <div className="h-px flex-1 bg-sand ml-3" />
          </div>
          <div className="bg-warm-white border border-sand rounded-2xl p-5">
            <p className="text-charcoal leading-relaxed italic font-heading text-lg">
              &ldquo;{dreamNarrative}&rdquo;
            </p>
          </div>
        </motion.section>

        {/* Worth a Second Look */}
        {(worthALook.player1 || worthALook.player2) && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex items-center mb-3">
              <h3 className="font-heading text-lg text-charcoal">Worth a Second Look</h3>
              <div className="h-px flex-1 bg-sand ml-3" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {worthALook.player1 && (
                <div className="rounded-2xl overflow-hidden border border-sand">
                  <div className="aspect-video">
                    <img src={worthALook.player1.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-warm-white p-3">
                    <p className="text-xs text-charcoal-light leading-snug">
                      <span className="font-medium text-charcoal">{session.player1_name}</span> loved this
                    </p>
                  </div>
                </div>
              )}
              {worthALook.player2 && (
                <div className="rounded-2xl overflow-hidden border border-sand">
                  <div className="aspect-video">
                    <img src={worthALook.player2.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-warm-white p-3">
                    <p className="text-xs text-charcoal-light leading-snug">
                      <span className="font-medium text-charcoal">{session.player2_name}</span> loved this
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Share */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="pb-4"
        >
          {/* Hidden share card for screenshot */}
          <div
            ref={shareCardRef}
            className="bg-cream p-8 rounded-2xl"
            style={{ position: 'absolute', left: '-9999px', width: '600px' }}
          >
            <div className="text-center mb-6">
              <h2 className="font-heading text-3xl text-charcoal mb-1">
                {session.player1_name} &amp; {session.player2_name}
              </h2>
              <p className="font-heading text-lg text-terracotta italic">
                Dream {roomLabel}
              </p>
            </div>
            <p className="text-charcoal text-sm leading-relaxed mb-6 italic">
              &ldquo;{dreamNarrative}&rdquo;
            </p>
            {topPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl overflow-hidden">
                {topPhotos.map((photo, i) => (
                  <div key={photo?.id || i} className="aspect-square">
                    <img src={photo?.url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {topTags.map(tag => (
                <span key={tag} className="bg-sand text-charcoal-light px-3 py-1 rounded-full text-xs">
                  {formatTag(tag)}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-warm-gray">Made with NestMatch</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-medium py-4 rounded-2xl shadow-md shadow-terracotta/20 transition-colors"
          >
            Save &amp; Share Our Style
          </motion.button>
        </motion.section>

      </div>
    </motion.div>
  )
}
