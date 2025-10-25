import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../contexts/AppContext'

export interface AuthError {
  message: string
}

export function useAuth() {
  const { state } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string; username?: string }
  ) => {
    setLoading(true)
    setError(null)

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      if (!metadata?.name) {
        throw new Error('Name is required')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            username: metadata.username || email.split('@')[0],
          },
        },
      })

      if (error) {
        setError({ message: error.message })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err: any) {
      const authError = {
        message: err.message || 'An unexpected error occurred during sign up',
      }
      setError(authError)
      return { data: null, error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError({ message: error.message })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err: any) {
      const authError = {
        message: err.message || 'An unexpected error occurred during sign in',
      }
      setError(authError)
      return { data: null, error: authError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError({ message: error.message })
        return { error }
      }

      return { error: null }
    } catch (err: any) {
      const authError = {
        message: err.message || 'An unexpected error occurred during sign out',
      }
      setError(authError)
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    user: state.user,
    loading: loading || state.loading,
    error,

    // Methods
    signUp,
    signIn,
    signOut,

    // Clear error
    clearError: () => setError(null),
  }
}
