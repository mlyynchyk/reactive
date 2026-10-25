import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '../api/http'

/**
 * Завантажує дані функцією loader (яка повертає Promise) і тримає стан loading/error.
 * reload() — повторне завантаження після змін.
 */
export function useLoad(loader, initial) {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await loader())
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setLoading(false)
    }
    // loader навмисно не в залежностях: передається інлайн і не змінюється за змістом
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, setData, loading, error, reload }
}
