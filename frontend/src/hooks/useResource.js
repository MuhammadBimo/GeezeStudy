import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'

/**
 * Ambil data GET dari API. `loading` hanya benar saat belum ada data untuk permintaan ini;
 * reload() menyegarkan di latar belakang tanpa mengosongkan tampilan.
 */
export function useResource(path, params) {
  const paramsKey = JSON.stringify(params ?? {})
  const key = `${path}?${paramsKey}`
  const [tick, setTick] = useState(0)
  const [state, setState] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    let cancelled = false
    api
      .get(path, { params: JSON.parse(paramsKey) })
      .then((res) => !cancelled && setState({ key, data: res.data, error: null }))
      .catch((error) => !cancelled && setState({ key, data: null, error }))
    return () => {
      cancelled = true
    }
  }, [path, paramsKey, key, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  // Ubah data lokal langsung (mis. setelah PATCH) tanpa menunggu permintaan ulang.
  const mutate = useCallback((updater) => setState((s) => ({ ...s, data: updater(s.data) })), [])

  return useMemo(() => {
    const fresh = state.key === key
    return { data: fresh ? state.data : null, error: fresh ? state.error : null, loading: !fresh, reload, mutate }
  }, [state, key, reload, mutate])
}
