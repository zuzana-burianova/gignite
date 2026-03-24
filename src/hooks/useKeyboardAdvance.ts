import { useEffect } from 'react'
import { useSetlistStore } from '../store/useSetlistStore'

export function useKeyboardAdvance() {
  const advance = useSetlistStore((s) => s.advance)
  const retreat = useSetlistStore((s) => s.retreat)
  const pedalKey = useSetlistStore((s) => s.pedalKey)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Prevent default scroll behavior for common pedal keys
      if (['Space', 'ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp'].includes(e.code)) {
        e.preventDefault()
      }
      if (e.code === pedalKey) advance()
      if (e.code === 'ArrowLeft' || e.code === 'PageUp') retreat()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pedalKey, advance, retreat])
}
