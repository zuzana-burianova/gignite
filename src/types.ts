export interface Track {
  id: string
  name: string
  artists: string
  durationMs: number
}

export interface Setlist {
  playlistId: string
  playlistName: string
  tracks: Track[]
  loadedAt: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  items: { total: number }
  images: { url: string }[]
}
