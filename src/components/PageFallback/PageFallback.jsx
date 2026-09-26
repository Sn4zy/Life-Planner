import './PageFallback.css'

export default function PageFallback() {
  return (
    <div className="page-fallback" role="status" aria-live="polite">
      <span className="page-fallback__spinner" aria-hidden="true" />
      <span className="visually-hidden">Loading…</span>
    </div>
  )
}
