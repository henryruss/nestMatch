import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useSession } from '../hooks/useSession'
import { useSwipes, usePartnerProgress } from '../hooks/useSwipes'
import { ROOM_TYPES, PHOTOS_PER_SUBCATEGORY } from '../lib/constants'
import { getStyleSummary } from '../lib/api'

export default function WaitingRoom() {
  const { sessionId, playerNumber } = useParams()
  const playerNum = parseInt(playerNumber)
  const navigate = useNavigate()

  const { session } = useSession(sessionId)
  const { swipes, partnerSwipes } = useSwipes(sessionId, playerNum)

  const [styleSummary, setStyleSummary] = useState(null)
  const [topPhotos, setTopPhotos] = useState([])
  const [loadingSummary, setLoadingSummary] = useState(true)

  const roomConfig = session ? ROOM_TYPES[session.room_type] : null
  const subcategories = roomConfig?.subcategories || []
  const partnerName = session ? (playerNum === 1 ? session.player2_name : session.player1_name) : ''
  const playerName = session ? (playerNum === 1 ? session.player1_name : session.player2_name) : ''

  const partnerProgress = usePartnerProgress(partnerSwipes, session?.room_type, subcategories)

  useEffect(() => {
    if (!session || swipes.length === 0) return

    const yesSwipes = swipes.filter(s => s.decision === 'yes')
    setTopPhotos(yesSwipes.slice(-3).map(s => s.photo_url))

    const tagCounts = {}
    for (const swipe of yesSwipes) {
      const tags = swipe.tags || []
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    }

    async function fetchSummary() {
      setLoadingSummary(true)
      const summary = await getStyleSummary(playerName, tagCounts, roomConfig?.label || 'room')
      setStyleSummary(summary)
      setLoadingSummary(false)
    }

    fetchSummary()
  }, [session?.id, swipes.length])

  useEffect(() => {
    if (partnerProgress.isFinished && swipes.length >= subcategories.length * PHOTOS_PER_SUBCATEGORY) {
      setTimeout(() => {
        navigate(`/session/${sessionId}/player/${playerNum}/elo`)
      }, 1500)
    }
  }, [partnerProgress.isFinished, swipes.length])

  if (!session) {
    return (
      <div className="app-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="app-screen flex flex-col px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs tracking-[0.18em] text-terracotta uppercase font-medium mb-2">
            Your Style Profile
          </p>
          <h2 className="font-heading text-3xl text-charcoal leading-tight">
            {playerName}'s<br /><em>Taste</em>
          </h2>
        </div>

        {/* Mood board */}
        {topPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden mb-5"
          >
            {topPhotos.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="aspect-square"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Style summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-warm-white border border-sand rounded-2xl p-5 mb-5"
        >
          {loadingSummary ? (
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full flex-shrink-0"
              />
              <span className="text-warm-gray-dark text-sm">Analysing your style...</span>
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-charcoal leading-relaxed italic font-heading text-lg"
            >
              &ldquo;{styleSummary}&rdquo;
            </motion.p>
          )}
        </motion.div>

        {/* Partner progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-auto"
        >
          {!partnerProgress.isFinished ? (
            <div className="bg-sand/40 border border-sand rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-terracotta"
                  />
                  <span className="text-sm font-medium text-charcoal">
                    Waiting for {partnerName}
                  </span>
                </div>
                <span className="text-xs text-warm-gray tabular-nums">
                  {Math.round((partnerProgress.completedPhotos / partnerProgress.totalPhotos) * 100)}%
                </span>
              </div>
              <div className="w-full h-1 bg-sand rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-terracotta-light rounded-full"
                  animate={{ width: `${(partnerProgress.completedPhotos / partnerProgress.totalPhotos) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-warm-gray-dark mt-2">
                {partnerName} is on category {partnerProgress.currentSubcategoryIndex} of {partnerProgress.totalSubcategories}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sage/10 border border-sage/30 rounded-2xl p-4 text-center"
            >
              <p className="text-sage-dark font-medium mb-0.5">{partnerName} is done!</p>
              <p className="text-warm-gray-dark text-sm">Moving to the ranking phase...</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
