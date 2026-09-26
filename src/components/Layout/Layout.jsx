import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './Layout.css'

const NAV_ITEMS = [
  { path: '/schedule', label: 'Schedule' },
  { path: '/bookmarks', label: 'Bookmarks' },
  { path: '/notebook', label: 'Notebook' },
  { path: '/documents', label: 'Documents' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" aria-hidden="true" />

      <header className="app-shell__header glass">
        <button
          type="button"
          className="app-shell__brand"
          aria-current={pathname === '/' ? 'page' : undefined}
          onClick={() => navigate('/')}
        >
          Dashboard
        </button>

        <nav aria-label="Primary">
          <ul className="app-shell__nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <button
                  type="button"
                  className="app-shell__nav-link"
                  aria-current={pathname === item.path ? 'page' : undefined}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}
