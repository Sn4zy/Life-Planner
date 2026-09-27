import { useEffect, useState } from 'react'
import { loadAsset } from '../lib/assets.js'

// Resolves an asset id from IndexedDB to an object URL, revoked when the id changes or on unmount.
export default function useAssetUrl(assetId) {
  const [loaded, setLoaded] = useState({ id: null, url: null })

  useEffect(() => {
    if (!assetId) return undefined
    let cancelled = false
    let objectUrl = null

    loadAsset(assetId)
      .then((blob) => {
        if (cancelled || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setLoaded({ id: assetId, url: objectUrl })
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [assetId])

  return assetId && loaded.id === assetId ? loaded.url : null
}
