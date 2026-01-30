import { useEffect, useCallback } from 'react'

type ShortcutHandler = () => void

type Shortcuts = {
  onFocusDriverA?: ShortcutHandler
  onFocusDriverB?: ShortcutHandler
  onToggleDarkMode?: ShortcutHandler
  onToggleLiveMode?: ShortcutHandler
  onPrint?: ShortcutHandler
  onShare?: ShortcutHandler
  onScrollToTop?: ShortcutHandler
  onScrollToH2H?: ShortcutHandler
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const { key, ctrlKey, metaKey, shiftKey } = event
      const modKey = ctrlKey || metaKey

      // Ctrl/Cmd + 1: Focus Driver A selector
      if (modKey && key === '1') {
        event.preventDefault()
        shortcuts.onFocusDriverA?.()
        return
      }

      // Ctrl/Cmd + 2: Focus Driver B selector
      if (modKey && key === '2') {
        event.preventDefault()
        shortcuts.onFocusDriverB?.()
        return
      }

      // Ctrl/Cmd + D: Toggle dark mode
      if (modKey && key === 'd') {
        event.preventDefault()
        shortcuts.onToggleDarkMode?.()
        return
      }

      // Ctrl/Cmd + L: Toggle live mode
      if (modKey && key === 'l') {
        event.preventDefault()
        shortcuts.onToggleLiveMode?.()
        return
      }

      // Ctrl/Cmd + P: Print
      if (modKey && key === 'p') {
        event.preventDefault()
        shortcuts.onPrint?.()
        return
      }

      // Ctrl/Cmd + Shift + S: Share
      if (modKey && shiftKey && key === 'S') {
        event.preventDefault()
        shortcuts.onShare?.()
        return
      }

      // Home: Scroll to top
      if (key === 'Home' && !modKey) {
        shortcuts.onScrollToTop?.()
        return
      }

      // H: Scroll to H2H section
      if (key === 'h' && !modKey && !shiftKey) {
        shortcuts.onScrollToH2H?.()
        return
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Keyboard shortcuts info for help display
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', '1'], description: 'Focus Driver A selector' },
  { keys: ['Ctrl', '2'], description: 'Focus Driver B selector' },
  { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
  { keys: ['Ctrl', 'L'], description: 'Toggle live mode' },
  { keys: ['Ctrl', 'P'], description: 'Print comparison' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Share comparison' },
  { keys: ['H'], description: 'Scroll to Head-to-Head' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
]
