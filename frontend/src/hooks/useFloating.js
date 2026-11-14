import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

/**
 * Posisi panel melayang (select, date picker, menu) relatif ke pemicunya.
 * Panel memakai position: fixed dan dirender lewat portal ke <dialog> terdekat atau <body>,
 * jadi tidak terpotong oleh kontainer yang bisa digulir. Membalik ke atas bila ruang di bawah sempit.
 */
export function useFloating({ open, anchorRef, panelRef, matchWidth = true, align = 'start', point = null, onClose }) {
  const [style, setStyle] = useState({ position: 'fixed', top: -9999, left: -9999 })

  const place = useCallback(() => {
    const panel = panelRef.current
    if (!panel || (!anchorRef.current && !point)) return
    const rect = point ? { left: point.x, right: point.x, top: point.y, bottom: point.y, width: 0 } : anchorRef.current.getBoundingClientRect()
    const gap = point ? 2 : 6
    const width = matchWidth && !point ? Math.max(rect.width, 200) : panel.offsetWidth
    const height = panel.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight

    const below = vh - rect.bottom - gap
    const flip = below < Math.min(height, 320) && rect.top > below
    const top = flip ? Math.max(8, rect.top - height - gap) : Math.min(rect.bottom + gap, vh - Math.min(height, vh - 16) - 8)
    let left = align === 'end' ? rect.right - width : rect.left
    left = Math.min(Math.max(8, left), vw - width - 8)

    setStyle({ position: 'fixed', top, left, width: matchWidth && !point ? width : undefined, maxHeight: Math.max(160, (flip ? rect.top : below) - 16), '--origin': flip ? 'bottom' : 'top' })
  }, [anchorRef, panelRef, matchWidth, align, point])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return
      onClose()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        onClose(true)
      }
    }
    const onScroll = (e) => {
      if (panelRef.current?.contains(e.target)) return
      place()
    }
    document.addEventListener('pointerdown', onDown, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, onClose, place, panelRef, anchorRef])

  return style
}

/** Target portal: <dialog> terbuka terdekat (top layer) atau body. */
export const portalTarget = (el) => el?.closest('dialog') ?? document.body
