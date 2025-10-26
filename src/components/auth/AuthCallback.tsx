import { useEffect, useState } from 'react'
// Database imports removed - will be replaced with new Supabase project

interface AuthCallbackProps {
  onAuthSuccess: () => void
  onAuthError: (error: string) => void
}

export default function AuthCallback({
  onAuthSuccess,
  onAuthError,
}: AuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('loading')
        setMessage('Completing sign in...')

       // TODO: Re-implement auth callback with new Supabase project
        console.warn('Auth callback not yet implemented')
        setStatus('error')
        setMessage('Authentication system not yet configured.')
        onAuthError('Authentication system not yet configured')
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        setStatus('error')
        setMessage('An unexpected error occurred.')
        onAuthError('An unexpected error occurred')
      }
    }

    handleAuthCallback()
  }, [onAuthSuccess, onAuthError])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Completing sign in...
            </h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-800">
              Success!
            </h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-800">
              Authentication Failed
            </h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}
