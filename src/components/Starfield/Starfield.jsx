import { memo } from 'react'
import { motion, useReducedMotionConfig } from 'framer-motion'
import './Starfield.css'

// Each layer tiles this height twice (element + ::after copy), so it must exceed the viewport height.
const FIELD_HEIGHT = 2000

const LAYER_CONFIG = [
  { id: 'far', count: 520, size: 1, duration: 260, minAlpha: 0.2, maxAlpha: 0.65 },
  { id: 'mid', count: 160, size: 2, duration: 150, minAlpha: 0.3, maxAlpha: 0.8 },
  { id: 'near', count: 50, size: 3, duration: 85, minAlpha: 0.45, maxAlpha: 0.95 },
]

function generateStars({ count, minAlpha, maxAlpha }) {
  return Array.from({ length: count }, () => {
    const x = (Math.random() * 100).toFixed(2)
    const y = Math.round(Math.random() * FIELD_HEIGHT)
    const alpha = (minAlpha + Math.random() * (maxAlpha - minAlpha)).toFixed(2)
    return `${x}vw ${y}px rgb(var(--star-rgb) / ${alpha})`
  }).join(', ')
}

const LAYERS = LAYER_CONFIG.map((layer) => ({ ...layer, shadows: generateStars(layer) }))

function Starfield() {
  const reduceMotion = useReducedMotionConfig()

  return (
    <div
      className="starfield"
      style={{ '--starfield-height': `${FIELD_HEIGHT}px` }}
      aria-hidden="true"
    >
      {LAYERS.map((layer) => (
        <motion.div
          key={layer.id}
          className="starfield__layer"
          style={{ width: layer.size, height: layer.size, boxShadow: layer.shadows }}
          animate={reduceMotion ? undefined : { y: [0, -FIELD_HEIGHT] }}
          transition={{ duration: layer.duration, ease: 'linear', repeat: Infinity }}
        />
      ))}
    </div>
  )
}

export default memo(Starfield)
