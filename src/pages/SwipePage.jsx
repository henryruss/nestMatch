import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { useSwipes, usePartnerProgress } from '../hooks/useSwipes'
import { fetchPhotosForSubcategory } from '../lib/unsplash'
import { ROOM_TYPES } from '../lib/constants'
import SwipeCard from '../components/SwipeCard'
import PartnerBanner from '../components/PartnerBanner'

export default function SwipePage() {
  const { sessionId, playerNumber } = useParams()
  const playerNum = parseInt(playerNumber)
  const navigate = useNavigate()

  const { session, loading: sessionLoading } = useSession(sessionId)
  const { swipes, partnerSwipes, saveSwipe } = useSwipes(sessionId, playerNum)

  const [currentSubcategoryIndex, setCurrentSubcategoryIndex] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photos, setPhotos] = useState([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [allPhotos, setAllPhotos] = useState({}) // cache by subcategory

  const roomConfig = session ? ROOM_TYPES[session.room_type] : null
  const subcategories = roomConfig?.subcategories || []
  const currentSubcategory = subcategories[currentSubcategoryIndex]

  const partnerName = session
    ? (playerNum === 1 ? session.player2_name : session.player1_name)
    : ''

  const partnerProgress = usePartnerProgress(partnerSwipes, session?.room_type, subcategories)

  // Calculate resume position from existing swipes
  useEffect(() => {
    if (!subcategories.length || !swipes.length) return

    // Count swipes per subcategory
    const counts = {}
    for (const sub of subcategories) {
      counts[sub.id] = 0
    }
    for (const swipe of swipes) {
      if (counts[swipe.subcategory] !== undefined) {
        counts[swipe.subcategory]++
      }
    }

    // Find first incomplete subcategory
    for (let i = 0; i < subcategories.length; i++) {
      if (counts[subcategories[i].id] < 10) {
        setCurrentSubcategoryIndex(i)
        setCurrentPhotoIndex(counts[subcategories[i].id])
        return
      }
    }

    // All done — navigate to waiting/elo
    navigate(`/session/${sessionId}/player/${playerNum}/waiting`)
  }, [subcategories.length, swipes.length])

  // Load photos for current subcategory
  useEffect(() => {
    if (!currentSubcategory) return

    async function loadPhotos() {
      if (allPhotos[currentSubcategory.id]) {
        setPhotos(allPhotos[currentSubcategory.id])
        setLoadingPhotos(false)
        return
      }

      setLoadingPhotos(true)
      const fetched = await fetchPhotosForSubcategory(currentSubcategory.keywords)
      setPhotos(fetched)
      setAllPhotos(prev => ({ ...prev, [currentSubcategory.id]: fetched }))
      setLoadingPhotos(false)
    }

    loadPhotos()
  }, [currentSubcategory?.id])

  // Prefetch next subcategory
  useEffect(() => {
    const nextIndex = currentSubcategoryIndex + 1
    if (nextIndex < subcategories.length && !allPhotos[subcategories[nextIndex].id]) {
      fetchPhotosForSubcategory(subcategories[nextIndex].keywords).then(fetched => {
        setAllPhotos(prev => ({ ...prev, [subcategories[nextIndex].id]: fetched }))
      })
    }
  }, [currentSubcategoryIndex, subcategories])

  const handleSwipe = useCallback(async (decision) => {
    if (!photos[currentPhotoIndex] || !currentSubcategory) return

    await saveSwipe(photos[currentPhotoIndex], decision, currentSubcategory.id)

    const nextPhoto = currentPhotoIndex + 1

    if (nextPhoto >= photos.length) {
      // Move to next subcategory
      const nextSubcategory = currentSubcategoryIndex + 1
      if (nextSubcategory >= subcategories.length) {
        // Done with all swiping
        navigate(`/session/${sessionId}/player/${playerNum}/waiting`)
        return
      }
      setCurrentSubcategoryIndex(nextSubcategory)
      setCurrentPhotoIndex(0)
    } else {
      setCurrentPhotoIndex(nextPhoto)
    }
  }, [currentPhotoIndex, currentSubcategoryIndex, photos, currentSubcategory, subcategories, saveSwipe, navigate, sessionId, playerNum])

  if (sessionLoading) {
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

  if (!session) {
    return (
      <div className="app-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="font-heading text-2xl text-charcoal mb-2">Session not found</h2>
          <p className="text-warm-gray-dark mb-4">This link may have expired or is invalid.</p>
          <button
            onClick={() => navigate('/')}
            className="text-terracotta hover:text-terracotta-dark transition-colors"
          >
            Start a new session
          </button>
        </div>
      </div>
    )
  }

  const playerName = playerNum === 1 ? session.player1_name : session.player2_name

  return (
    <div className="app-screen flex flex-col pb-8">
      <PartnerBanner partnerName={partnerName} progress={partnerProgress} />

      {/* Header */}
      <div className="text-center px-4 pt-5 mb-3">
        <h1 className="font-heading text-2xl text-charcoal">
          {playerName}'s Turn
        </h1>
        <p className="text-xs text-warm-gray-dark mt-0.5">
          {roomConfig?.label}
        </p>
      </div>

      {/* Swipe Area */}
      {loadingPhotos ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full mx-auto mb-3"
            />
            <p className="text-warm-gray-dark text-sm">Loading photos...</p>
          </div>
        </div>
      ) : photos[currentPhotoIndex] ? (
        <div className="flex-1 flex items-center">
          <SwipeCard
            photo={photos[currentPhotoIndex]}
            onSwipe={handleSwipe}
            subcategoryLabel={currentSubcategory?.label}
            current={currentPhotoIndex + 1}
            total={photos.length}
            subcategoryIndex={currentSubcategoryIndex + 1}
            totalSubcategories={subcategories.length}
          />
        </div>
      ) : null}
    </div>
  )
}
