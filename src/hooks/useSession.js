import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSession(sessionId) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    async function fetchSession() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setSession(data)
      }
      setLoading(false)
    }

    fetchSession()

    // Subscribe to session changes
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        setSession(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const updateSession = useCallback(async (updates) => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Update session error:', error)
    } else {
      setSession(data)
    }
    return { data, error }
  }, [sessionId])

  return { session, loading, error, updateSession }
}
