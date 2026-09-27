// Reveal presets matching the Home tile scroll-reveal. Pass the stagger delay (seconds) as `custom`.
export const EASE_OUT = [0.22, 1, 0.36, 1]

const visible = (delay = 0) => ({
  opacity: 1,
  y: 0,
  scale: 1,
  transition: { duration: 0.7, ease: EASE_OUT, delay },
})

export const revealVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible,
}

export const subtleRevealVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible,
}

export const staggerDelay = (index, step = 0.09, maxSteps = 6) => Math.min(index, maxSteps) * step
