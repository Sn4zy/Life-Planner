import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeTile from './HomeTile.jsx'
import './Home.css'

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const TILES = [
  {
    id: 'schedule',
    to: '/schedule',
    title: 'Schedule',
    description: 'Your week at a glance, Monday to Sunday.',
    size: 'large',
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="5" width="17" height="15" rx="3" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    id: 'bookmarks',
    to: '/bookmarks',
    title: 'Bookmarks',
    description: 'Saved links, art and references.',
    size: 'wide',
    icon: (
      <svg {...iconProps}>
        <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-4-6.5 4V5a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    id: 'notebook',
    to: '/notebook',
    title: 'Notebook',
    description: 'Free-write, autosaved.',
    size: 'small',
    icon: (
      <svg {...iconProps}>
        <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
        <path d="M13.5 6.5l4 4" />
      </svg>
    ),
  },
  {
    id: 'documents',
    to: '/documents',
    title: 'Documents',
    description: 'Files, searchable.',
    size: 'small',
    icon: (
      <svg {...iconProps}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  const handleSelect = useCallback((to) => navigate(to), [navigate])

  return (
    <section className="home">
      <header className="home__intro">
        <p className="eyebrow">Welcome back</p>
        <h1 className="home__title">Where to next?</h1>
      </header>

      <div className="home__grid">
        {TILES.map((tile, index) => (
          <HomeTile
            key={tile.id}
            index={index}
            to={tile.to}
            title={tile.title}
            description={tile.description}
            size={tile.size}
            icon={tile.icon}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  )
}
