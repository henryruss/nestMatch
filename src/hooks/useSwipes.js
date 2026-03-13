import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PHOTOS_PER_SUBCATEGORY } from '../lib/constants'

export function useSwipes(sessionId, playerNumber) {
  const [swipes, setSwipes] = useState([])
  const [partnerSwipes, setPartnerSwipes] = useState([])

  const partnerNumber = playerNumber === 1 ? 2 : 1

  useEffect(() => {
    if (!sessionId) return

    // Fetch existing swipes for this player
    async function fetchSwipes() {
      const { data } = await supabase
        .from('swipes')
        .select('*')
        .eq('session_id', sessionId)
        .eq('player_number', playerNumber)
        .order('created_at', { ascending: true })

      if (data) setSwipes(data)
    }

    async function fetchPartnerSwipes() {
      const { data } = await supabase
        .from('swipes')
        .select('*')
        .eq('session_id', sessionId)
        .eq('player_number', partnerNumber)
        .order('created_at', { ascending: true })

      if (data) setPartnerSwipes(data)
    }

    fetchSwipes()
    fetchPartnerSwipes()

    // Subscribe to partner's swipes for real-time progress
    const channel = supabase
      .channel(`swipes-partner-${sessionId}-${partnerNumber}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'swipes',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (payload.new.player_number === partnerNumber) {
          setPartnerSwipes(prev => [...prev, payload.new])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, playerNumber, partnerNumber])

  const saveSwipe = useCallback(async (photo, decision, subcategory) => {
    const swipeData = {
      session_id: sessionId,
      player_number: playerNumber,
      photo_id: photo.id,
      photo_url: photo.url,
      tags: photo.tags,
      decision,
      subcategory,
    }

    const { data, error } = await supabase
      .from('swipes')
      .insert(swipeData)
      .select()
      .single()

    if (error) {
      console.error('Save swipe error:', error)
    } else {
      setSwipes(prev => [...prev, data])
    }

    return { data, error }
  }, [sessionId, playerNumber])

  return { swipes, partnerSwipes, saveSwipe }
}

export function usePartnerProgress(partnerSwipes, roomType, subcategories) {
  const totalPhotos = subcategories.length * PHOTOS_PER_SUBCATEGORY
  const completedPhotos = partnerSwipes.length

  // Figure out which subcategory partner is on
  const swipesPerSubcategory = {}
  for (const sub of subcategories) {
    swipesPerSubcategory[sub.id] = 0
  }
  for (const swipe of partnerSwipes) {
    if (swipesPerSubcategory[swipe.subcategory] !== undefined) {
      swipesPerSubcategory[swipe.subcategory]++
    }
  }

  let currentSubcategoryIndex = 0
  for (let i = 0; i < subcategories.length; i++) {
    if (swipesPerSubcategory[subcategories[i].id] < PHOTOS_PER_SUBCATEGORY) {
      currentSubcategoryIndex = i
      break
    }
    if (i === subcategories.length - 1) {
      currentSubcategoryIndex = i
    }
  }

  const isFinished = completedPhotos >= totalPhotos

  return {
    totalPhotos,
    completedPhotos,
    currentSubcategory: subcategories[currentSubcategoryIndex]?.label || '',
    currentSubcategoryIndex: currentSubcategoryIndex + 1,
    totalSubcategories: subcategories.length,
    isFinished,
  }
}
