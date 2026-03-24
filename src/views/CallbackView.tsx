import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleCallback } from '../auth/spotify'

export function CallbackView() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const err = params.get('error')

    if (err) {
      setError(`Spotify denied access: ${err}`)
      return
    }
    if (!code || !state) {
      setError('Invalid callback — missing code or state')
      return
    }

    handleCallback(code, state)
      .then(() => navigate('/setup', { replace: true }))
      .catch((e: Error) => setError(e.message))
  }, [navigate])

  if (error) {
    return (
      <div style={{ color: '#ff4444', padding: '2rem', fontFamily: 'monospace' }}>
        <p>Auth error: {error}</p>
        <button onClick={() => navigate('/', { replace: true })}>Back</button>
      </div>
    )
  }

  return (
    <div style={{ color: '#666', padding: '2rem', textAlign: 'center' }}>
      Connecting to Spotify…
    </div>
  )
}
