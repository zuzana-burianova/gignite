import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlaylists, getPlaylistTracks } from '../api/spotifyClient'
import { logout } from '../auth/spotify'
import { useSetlistStore } from '../store/useSetlistStore'
import type { SpotifyPlaylist } from '../types'
import styles from './SetupView.module.css'

export function SetupView() {
  const navigate = useNavigate()
  const { setSetlist, loadFromCache, setlist, pedalKey, setPedalKey, clearSetlist } = useSetlistStore()

  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturingKey, setCapturingKey] = useState(false)

  useEffect(() => {
    getPlaylists()
      .then(setPlaylists)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))

  }, [])

  useEffect(() => {
    if (!capturingKey) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      setPedalKey(e.code)
      setCapturingKey(false)
    }
    window.addEventListener('keydown', handler, { once: true })
    return () => window.removeEventListener('keydown', handler)
  }, [capturingKey, setPedalKey])

  async function selectPlaylist(playlist: SpotifyPlaylist) {
    setLoadingTracks(true)
    setError(null)
    try {
      const tracks = await getPlaylistTracks(playlist.id)
      setSetlist({
        playlistId: playlist.id,
        playlistName: playlist.name,
        tracks,
        loadedAt: Date.now(),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tracks')
    } finally {
      setLoadingTracks(false)
    }
  }

  const cachedDate = setlist
    ? new Date(setlist.loadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Setup</h1>
        <button
          className={styles.disconnectBtn}
          onClick={() => { logout(); navigate('/', { replace: true }) }}
        >
          Disconnect Spotify
        </button>
      </header>

      {/* Pedal config */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Foot Pedal Key</h2>
        <div className={styles.pedalRow}>
          <span className={styles.pedalKey}>{pedalKey}</span>
          <button
            className={styles.btn}
            onClick={() => setCapturingKey(true)}
          >
            {capturingKey ? 'Press your pedal…' : 'Change'}
          </button>
        </div>
      </section>

      {/* Cached setlist shortcut */}
      {setlist && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Setlist</h2>
          <div className={styles.cachedSetlist}>
            <div>
              <div className={styles.playlistName}>{setlist.playlistName}</div>
              <div className={styles.trackCount}>
                {setlist.tracks.length} songs · loaded at {cachedDate}
              </div>
            </div>
            <div className={styles.cachedActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/stage')}>
                Go to Stage
              </button>
              <button className={styles.btn} onClick={clearSetlist}>Clear</button>
            </div>
          </div>
        </section>
      )}

      {/* Playlist picker */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Load from Spotify</h2>
        {error && <p className={styles.error}>{error}</p>}
        {loading ? (
          <p className={styles.hint}>Loading playlists…</p>
        ) : loadingTracks ? (
          <p className={styles.hint}>Loading tracks…</p>
        ) : (
          <ul className={styles.playlistList}>
            {playlists.map((p) => (
              <li key={p.id}>
                <button className={styles.playlistItem} onClick={() => selectPlaylist(p)}>
                  <span className={styles.playlistName}>{p.name}</span>
                  <span className={styles.trackCount}>{p.items?.total ?? '?'} songs</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
