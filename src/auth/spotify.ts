import { generatePKCE, generateState } from './pkce'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string
const SCOPES = 'playlist-read-private playlist-read-collaborative user-read-email'

const TOKEN_KEY = 'spotify_token'
const REFRESH_KEY = 'spotify_refresh'
const EXPIRY_KEY = 'spotify_expiry'
const SCOPE_KEY = 'spotify_scope'

export async function initiateLogin() {
  const { verifier, challenge } = await generatePKCE()
  const state = generateState()

  sessionStorage.setItem('pkce_verifier', verifier)
  sessionStorage.setItem('pkce_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state,
    show_dialog: 'true',
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function handleCallback(code: string, state: string): Promise<void> {
  const savedState = sessionStorage.getItem('pkce_state')
  const verifier = sessionStorage.getItem('pkce_verifier')

  if (state !== savedState) throw new Error('State mismatch — possible CSRF attack')
  if (!verifier) throw new Error('Missing PKCE verifier')

  sessionStorage.removeItem('pkce_state')
  sessionStorage.removeItem('pkce_verifier')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) throw new Error('Token exchange failed')
  const data = await res.json()
  storeTokens(data)
}

function storeTokens(data: { access_token: string; refresh_token: string; expires_in: number; scope?: string }) {
  localStorage.setItem(TOKEN_KEY, data.access_token)
  localStorage.setItem(REFRESH_KEY, data.refresh_token)
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + data.expires_in * 1000))
  if (data.scope) localStorage.setItem(SCOPE_KEY, data.scope)
}

export function getGrantedScopes(): string {
  return localStorage.getItem(SCOPE_KEY) ?? '(not stored)'
}

async function refreshToken(): Promise<void> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) throw new Error('No refresh token')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh,
      client_id: CLIENT_ID,
    }),
  })

  if (!res.ok) throw new Error('Token refresh failed')
  const data = await res.json()
  storeTokens(data)
}

export async function getAccessToken(): Promise<string> {
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) ?? 0)
  if (Date.now() > expiry - 60_000) {
    await refreshToken()
  }
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new Error('Not authenticated')
  return token
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_KEY)
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}
