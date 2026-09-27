import { useCallback, useEffect, useState } from 'react'
import { deleteRecord, getAllRecords, putRecord } from '../lib/db.js'

export default function useIndexedDB(storeName) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getAllRecords(storeName)
      .then((records) => {
        if (cancelled) return
        setItems(records)
        setStatus('ready')
      })
      .catch((loadError) => {
        if (cancelled) return
        setError(loadError)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [storeName])

  const putItem = useCallback(
    async (record) => {
      await putRecord(storeName, record)
      setItems((prev) => {
        const index = prev.findIndex((item) => item.id === record.id)
        if (index === -1) return [...prev, record]
        const next = [...prev]
        next[index] = record
        return next
      })
    },
    [storeName],
  )

  const removeItem = useCallback(
    async (id) => {
      await deleteRecord(storeName, id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [storeName],
  )

  return { items, status, error, putItem, removeItem }
}
