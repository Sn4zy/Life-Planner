import { memo, useEffect, useRef } from 'react'

function BlobImage({ blob, alt = '', className }) {
  const imageRef = useRef(null)

  useEffect(() => {
    const image = imageRef.current
    if (!image || !blob) return undefined

    const url = URL.createObjectURL(blob)
    image.src = url
    return () => {
      image.removeAttribute('src')
      URL.revokeObjectURL(url)
    }
  }, [blob])

  return <img ref={imageRef} alt={alt} className={className} decoding="async" />
}

export default memo(BlobImage)
