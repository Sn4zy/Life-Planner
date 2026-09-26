import { useNavigate } from 'react-router-dom'
import './PlaceholderPage.css'

export default function PlaceholderPage({ title, description }) {
  const navigate = useNavigate()

  return (
    <section className="placeholder-page">
      <div className="placeholder-page__panel glass">
        <p className="eyebrow">Coming soon</p>
        <h1 className="placeholder-page__title">{title}</h1>
        <p className="placeholder-page__description">{description}</p>
        <button
          type="button"
          className="placeholder-page__back"
          onClick={() => navigate('/')}
        >
          Back to hub
        </button>
      </div>
    </section>
  )
}
