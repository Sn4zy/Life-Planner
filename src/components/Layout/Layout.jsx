import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import useEditMode from '../../hooks/useEditMode.js'
import EditableBox from '../EditableBox/EditableBox.jsx'
import EditableSurface from '../EditableBox/EditableSurface.jsx'
import EditableText from '../EditableBox/EditableText.jsx'
import Starfield from '../Starfield/Starfield.jsx'
import StylePopover from '../StylePopover/StylePopover.jsx'
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx'
import './Layout.css'

const NAV_ITEMS = [
  { path: '/schedule', label: 'Schedule' },
  { path: '/bookmarks', label: 'Bookmarks' },
  { path: '/notebook', label: 'Notebook' },
  { path: '/documents', label: 'Documents' },
]

const BACKGROUND_ID = 'layout.background'

export default function Layout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isEditing, toggleEditing, selected, select } = useEditMode()

  const brandText = <EditableText id="layout.nav.brand">Dashboard</EditableText>

  return (
    <div className="app-shell">
      <EditableBox
        id={BACKGROUND_ID}
        label="Background"
        className="app-shell__backdrop-box"
        movable={false}
        resizable={false}
        clickToSelect={false}
      >
        <EditableSurface className="app-shell__backdrop" aria-hidden="true">
          <Starfield />
        </EditableSurface>
      </EditableBox>

      <EditableBox id="layout.nav" label="Navigation bar" className="app-shell__header-box" resizable={false}>
        <EditableSurface as="header" className="app-shell__header glass">
          {isEditing ? (
            <div className="app-shell__brand">{brandText}</div>
          ) : (
            <button
              type="button"
              className="app-shell__brand"
              aria-current={pathname === '/' ? 'page' : undefined}
              onClick={() => navigate('/')}
            >
              {brandText}
            </button>
          )}

          <div className="app-shell__actions" data-edit-ignore>
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

            {isEditing && (
              <button
                type="button"
                className="app-shell__edit-toggle app-shell__background-toggle"
                aria-pressed={selected?.id === BACKGROUND_ID}
                onClick={() => select(BACKGROUND_ID, 'Background')}
              >
                Background
              </button>
            )}

            <ThemeToggle />

            <button
              type="button"
              className="app-shell__edit-toggle"
              aria-pressed={isEditing}
              onClick={toggleEditing}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
                <path d="M13.5 6.5l4 4" />
              </svg>
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </EditableSurface>
      </EditableBox>

      <main className="app-shell__main">
        <Outlet />
      </main>

      <StylePopover />
    </div>
  )
}
