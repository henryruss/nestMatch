import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calculateElo, generateMatchups, initializeScores } from '../lib/elo'
import { ELO_COMPARISONS_PER_PLAYER } from '../lib/constants'

export function useElo(sessionId, playerNumber, sharedPhotos) {
  const [scores, setScores] = useState({})
  const [matchups, setMatchups] = useState([])
  const [currentMatchup, setCurrentMatchup] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [partnerComplete, setPartnerComplete] = useState(false)

  const partnerNumber = playerNumber === 1 ? 2 : 1

  useEffect(() => {
    if (!sharedPhotos || sharedPhotos.length < 4) {
      setIsComplete(true)
      return
    }

    setScores(initializeScores(sharedPhotos))
    setMatchups(generateMatchups(sharedPhotos, ELO_COMPARISONS_PER_PLAYER))
  }, [sharedPhotos])

  // Listen for partner's ELO completion
  useEffect(() => {
    if (!sessionId) return

    async function checkPartnerElo() {
      const { count } = await supabase
        .from('elo_comparisons')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('player_number', partnerNumber)

      if (count >= ELO_COMPARISONS_PER_PLAYER || (sharedPhotos && sharedPhotos.length < 4)) {
        setPartnerComplete(true)
      }
    }

    checkPartnerElo()

    const channel = supabase
      .channel(`elo-partner-${sessionId}-${partnerNumber}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'elo_comparisons',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (payload.new.player_number === partnerNumber) {
          checkPartnerElo()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, partnerNumber, sharedPhotos])

  const recordComparison = useCallback(async (winnerId, loserId) => {
    // Update local ELO scores
    const winnerRating = scores[winnerId] || 1500
    const loserRating = scores[loserId] || 1500
    const { winnerRating: newWinner, loserRating: newLoser } = calculateElo(winnerRating, loserRating)

    const newScores = {
      ...scores,
      [winnerId]: newWinner,
      [loserId]: newLoser,
    }
    setScores(newScores)

    // Save to Supabase
    await supabase.from('elo_comparisons').insert({
      session_id: sessionId,
      player_number: playerNumber,
      winner_photo_id: winnerId,
      loser_photo_id: loserId,
    })

    const nextMatchup = currentMatchup + 1
    setCurrentMatchup(nextMatchup)

    if (nextMatchup >= matchups.length) {
      setIsComplete(true)

      // Save final scores
      for (const [photoId, score] of Object.entries(newScores)) {
        const scoreField = playerNumber === 1 ? 'player1_elo' : 'player2_elo'
        const { data: existing } = await supabase
          .from('photo_scores')
          .select('*')
          .eq('session_id', sessionId)
          .eq('photo_id', photoId)
          .single()

        if (existing) {
          await supabase
            .from('photo_scores')
            .update({ [scoreField]: score, combined_elo: (existing.player1_elo || 1500) + (existing.player2_elo || 1500) - 1500 + score - 1500 })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('photo_scores')
            .insert({
              session_id: sessionId,
              photo_id: photoId,
              [scoreField]: score,
              combined_elo: score,
            })
        }
      }

      // Update session status
      await supabase
        .from('sessions')
        .update({ [`player${playerNumber}_elo_complete`]: true })
        .eq('id', sessionId)
    }

    return newScores
  }, [scores, currentMatchup, matchups, sessionId, playerNumber])

  return {
    scores,
    matchups,
    currentMatchup,
    isComplete,
    partnerComplete,
    recordComparison,
    totalMatchups: matchups.length,
  }
}
