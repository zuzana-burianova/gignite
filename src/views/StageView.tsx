import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetlistStore } from '../store/useSetlistStore'
import { useKeyboardAdvance } from '../hooks/useKeyboardAdvance'
import { useWakeLock } from '../hooks/useWakeLock'
import styles from './StageView.module.css'

export function StageView() {
  const navigate = useNavigate()
  const { setlist, currentIndex, advance, retreat } = useSetlistStore()
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  useKeyboardAdvance()
  useWakeLock()

  // Keep hidden input focused so BT pedal events fire on mobile
  useEffect(() => {
    hiddenInputRef.current?.focus()
    const refocus = () => {
      setTimeout(() => hiddenInputRef.current?.focus(), 50)
    }
    document.addEventListener('touchend', refocus)
    return () => document.removeEventListener('touchend', refocus)
  }, [])

  if (!setlist) {
    return (
      <div className={styles.empty}>
        <p>No setlist loaded.</p>
        <button className={styles.backBtn} onClick={() => navigate('/setup')}>Go to Setup</button>
      </div>
    )
  }

  const current = setlist.tracks[currentIndex]
  const next = setlist.tracks[currentIndex + 1] ?? null
  const total = setlist.tracks.length
  const isLast = currentIndex === total - 1

  return (
    <div className={styles.container} onClick={advance}>
      {/* Hidden input to capture BT pedal keyboard events on mobile */}
      <input
        ref={hiddenInputRef}
        className={styles.hiddenInput}
        readOnly
        aria-hidden="true"
      />

      {/* Header */}
      <header className={styles.header} onClick={(e) => e.stopPropagation()}>
        <button className={styles.navBtn} onClick={retreat} disabled={currentIndex === 0}>
          ‹
        </button>
        <span className={styles.position}>
          {currentIndex + 1} / {total}
        </span>
        <button className={styles.navBtn} onClick={advance} disabled={isLast}>
          ›
        </button>
        <button className={styles.setupBtn} onClick={() => navigate('/setup')}>
          ⚙
        </button>
      </header>

      {/* Current song */}
      <main className={styles.main}>
        <div className={styles.currentSong}>
          <div className={styles.songName}>{current.name}</div>
          <div className={styles.artistName}>{current.artists}</div>
        </div>

        {/* Next song */}
        <div className={styles.nextSong}>
          {next ? (
            <>
              <span className={styles.nextLabel}>Next</span>
              <span className={styles.nextName}>{next.name}</span>
            </>
          ) : (
            <span className={styles.nextLabel}>End of setlist</span>
          )}
        </div>
      </main>

      {/* Progress dots */}
      <footer className={styles.footer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dots}>
          {setlist.tracks.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      </footer>
    </div>
  )
}
