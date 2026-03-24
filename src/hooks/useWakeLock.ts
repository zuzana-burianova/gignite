import { useEffect } from 'react'

export function useWakeLock() {
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Not supported or denied — fail silently
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      wakeLock?.release()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
