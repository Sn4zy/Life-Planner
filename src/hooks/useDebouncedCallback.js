import { useCallback, useEffect, useRef } from 'react'

// Returns `run` (debounced) and `flush` (fires any pending call now). Pending calls flush on unmount.
export default function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback)
  const timerRef = useRef(null)
  const argsRef = useRef([])

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const flush = useCallback(() => {
    if (timerRef.current === null) return
    clearTimeout(timerRef.current)
    timerRef.current = null
    callbackRef.current(...argsRef.current)
  }, [])

  const run = useCallback(
    (...args) => {
      argsRef.current = args
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(flush, delay)
    },
    [delay, flush],
  )

  useEffect(() => flush, [flush])

  return { run, flush }
}
