import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useSession } from '../hooks/useSession'
import { useElo } from '../hooks/useElo'
import { useSwipes, usePartnerProgress } from '../hooks/useSwipes'
import { ROOM_TYPES } from '../lib/constants'
import EloComparison from '../components/EloComparison'
import PartnerBanner from '../components/PartnerBanner'

export default function EloPage() {
  const { sessionId, playerNumber } = useParams()
  const playerNum = parseInt(playerNumber)
  const navigate = useNavigate()

  const { session } = useSession(sessionId)
  const { swipes, partnerSwipes } = useSwipes(sessionId, playerNum)

  const [sharedPhotos, setSharedPhotos] = useState(null)
  const [loading, setLoading] = useState(true)

  const partnerNum = playerNum === 1 ? 2 : 1
  const partnerName = session ? (playerNum === 1 ? session.player2_name : session.player1_name) : ''

  // Find shared yes photos
  useEffect(() => {
    if (!sessionId) return

    async function findSharedPhotos() {
      // Fetch both players' swipes
      const { data: allSwipes } = await supabase
        .from('swipes')
        .select('*')
        .eq('session_id', sessionId)
        .eq('decision', 'yes')

      if (!allSwipes) {
        setSharedPhotos([])
        setLoading(false)
        return
      }

      const player1Yes = new Set()
      const player2Yes = new Set()
      const photoMap = {}

      for (const swipe of allSwipes) {
        photoMap[swipe.photo_id] = {
          id: swipe.photo_id,
          url: swipe.photo_url,
          tags: swipe.tags,
          description: '',
        }
        if (swipe.player_number === 1) player1Yes.add(swipe.photo_id)
        else player2Yes.add(swipe.photo_id)
      }

      // Find intersection
      const shared = [...player1Yes].filter(id => player2Yes.has(id)).map(id => photoMap[id])
      setSharedPhotos(shared)
      setLoading(false)
    }

    findSharedPhotos()
  }, [sessionId])

  const {
    matchups,
    currentMatchup,
    isComplete,
    partnerComplete,
    recordComparison,
    totalMatchups,
  } = useElo(sessionId, playerNum, sharedPhotos)

  // Navigate to results when both done
  useEffect(() => {
    if (isComplete && partnerComplete) {
      setTimeout(() => {
        navigate(`/session/${sessionId}/results`)
      }, 1500)
    }
  }, [isComplete, partnerComplete])

  // Skip ELO if too few shared photos
  useEffect(() => {
    if (sharedPhotos && sharedPhotos.length < 4) {
      // Mark as complete and go to results
      async function markComplete() {
        await supabase
          .from('sessions')
          .update({ [`player${playerNum}_elo_complete`]: true })
          .eq('id', sessionId)

        // Check if partner is also done
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (data?.[`player${partnerNum}_elo_complete`]) {
          navigate(`/session/${sessionId}/results`)
        }
      }
      markComplete()
    }
  }, [sharedPhotos])

  if (loading || !sharedPhotos) {
    return (
      <div className="app-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full mx-auto mb-3"
          />
          <p className="text-warm-gray-dark text-sm">Finding your shared favorites...</p>
        </div>
      </div>
    )
  }

  if (sharedPhotos.length < 4) {
    return (
      <div className="app-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-sm"
        >
          <p className="text-xs tracking-[0.18em] text-terracotta uppercase font-medium mb-4">Interesting</p>
          <h2 className="font-heading text-2xl text-charcoal mb-3 leading-snug">
            You two have very different taste!
          </h2>
          <p className="text-warm-gray-dark text-sm mb-6 leading-relaxed">
            You only matched on {sharedPhotos.length} photo{sharedPhotos.length !== 1 ? 's' : ''}, so we'll skip the ranking and head straight to your results.
          </p>
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-terracotta"
            />
            <span className="text-sm text-warm-gray-dark">
              Waiting for {partnerName}...
            </span>
          </div>
        </motion.div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="app-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <h2 className="font-heading text-3xl text-charcoal mb-4">
            Rankings<br /><em>complete!</em>
          </h2>
          {!partnerComplete ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-terracotta"
              />
              <span className="text-sm text-warm-gray-dark">
                Waiting for {partnerName} to finish...
              </span>
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sage-dark font-medium"
            >
              Both done! Preparing your dream room...
            </motion.p>
          )}
        </motion.div>
      </div>
    )
  }

  const currentPair = matchups[currentMatchup]
  if (!currentPair) return null

  return (
    <div className="app-screen flex flex-col py-2">
      <div className="flex-1 flex items-center">
        <EloComparison
          photo1={currentPair[0]}
          photo2={currentPair[1]}
          onChoose={recordComparison}
          current={currentMatchup + 1}
          total={totalMatchups}
        />
      </div>
    </div>
  )
}
