import { getAccessToken } from '../auth/spotify'
import type { SpotifyPlaylist, Track } from '../types'

async function apiFetch<T>(path: string): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Spotify API ${res.status}: ${body?.error?.message ?? JSON.stringify(body)}`)
  }
  return res.json()
}

export async function getPlaylists(): Promise<SpotifyPlaylist[]> {
  const playlists: SpotifyPlaylist[] = []
  const limit = 50
  let offset = 0

  while (true) {
    const data: { items: SpotifyPlaylist[]; total: number } = await apiFetch(
      `/me/playlists?limit=${limit}&offset=${offset}`
    )
    playlists.push(...data.items)
    offset += data.items.length
    if (offset >= data.total) break
  }

  return playlists
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const tracks: Track[] = []
  const limit = 100
  let offset = 0

  while (true) {
    const data: {
      total: number
      items: { item: { id: string; name: string; duration_ms: number; artists: { name: string }[] } | null }[]
    } = await apiFetch(`/playlists/${playlistId}/items?limit=${limit}&offset=${offset}`)

    for (const entry of data.items) {
      if (!entry.item) continue
      tracks.push({
        id: entry.item.id,
        name: entry.item.name,
        artists: entry.item.artists.map((a) => a.name).join(', '),
        durationMs: entry.item.duration_ms,
      })
    }

    offset += data.items.length
    if (offset >= data.total) break
  }

  return tracks
}
