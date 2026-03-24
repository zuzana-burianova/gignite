import { create } from 'zustand'
import type { Setlist } from '../types'

const CACHE_KEY = 'setlist_cache'
const PEDAL_KEY = 'pedal_key'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface SetlistStore {
  setlist: Setlist | null
  currentIndex: number
  pedalKey: string
  setSetlist: (s: Setlist) => void
  advance: () => void
  retreat: () => void
  setCurrentIndex: (n: number) => void
  setPedalKey: (key: string) => void
  loadFromCache: () => boolean
  clearSetlist: () => void
}

export const useSetlistStore = create<SetlistStore>((set, get) => ({
  setlist: null,
  currentIndex: 0,
  pedalKey: localStorage.getItem(PEDAL_KEY) ?? 'Space',

  setSetlist: (setlist) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(setlist))
    set({ setlist, currentIndex: 0 })
  },

  advance: () => {
    const { setlist, currentIndex } = get()
    if (setlist && currentIndex < setlist.tracks.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  retreat: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 })
  },

  setCurrentIndex: (n) => set({ currentIndex: n }),

  setPedalKey: (key) => {
    localStorage.setItem(PEDAL_KEY, key)
    set({ pedalKey: key })
  },

  loadFromCache: () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return false
      const setlist = JSON.parse(raw) as Setlist
      if (Date.now() - setlist.loadedAt > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_KEY)
        return false
      }
      set({ setlist, currentIndex: 0 })
      return true
    } catch {
      return false
    }
  },

  clearSetlist: () => {
    localStorage.removeItem(CACHE_KEY)
    set({ setlist: null, currentIndex: 0 })
  },
}))
