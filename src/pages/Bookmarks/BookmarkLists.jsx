import { memo, useRef, useState } from 'react'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import EditableText from '../../components/EditableBox/EditableText.jsx'
import { ALL_LISTS } from './bookmarksUtils.js'

const LIST_NAME_MAX = 40

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  )
}

// Enter or blur commits, Escape cancels. Guarded so a blur fired while unmounting can't commit twice.
function ListNameInput({ initialValue = '', label, onCommit, onCancel }) {
  const [value, setValue] = useState(initialValue)
  const settledRef = useRef(false)

  const settle = (commit) => {
    if (settledRef.current) return
    settledRef.current = true
    const name = value.trim()
    if (commit && name) onCommit(name)
    else onCancel()
  }

  return (
    <input
      className="bookmarks-lists__input"
      type="text"
      value={value}
      maxLength={LIST_NAME_MAX}
      placeholder="List name"
      aria-label={label}
      autoFocus
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => settle(true)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          settle(true)
        } else if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          settle(false)
        }
      }}
    />
  )
}

function BookmarkLists({ lists, counts, total, activeId, onSelect, onCreate, onRename, onDelete }) {
  const [creating, setCreating] = useState(false)
  const [renamingId, setRenamingId] = useState(null)

  return (
    <EditableBox id="bookmarks.lists" label="Lists sidebar" className="bookmarks-lists-box" passThrough>
      <EditableSurface as="aside" className="bookmarks-lists glass" aria-label="Bookmark lists">
        <div className="bookmarks-lists__header">
          <EditableText id="bookmarks.lists.title" as="h2" className="bookmarks-lists__title">
            My Lists
          </EditableText>
          <button
            type="button"
            className="bookmarks-lists__add"
            aria-label="New list"
            title="New list"
            onClick={() => setCreating(true)}
          >
            +
          </button>
        </div>

        <ul className="bookmarks-lists__items">
          <li className="bookmarks-lists__row">
            <button
              type="button"
              className="bookmarks-lists__item"
              aria-pressed={activeId === null}
              onClick={() => onSelect(ALL_LISTS)}
            >
              <span className="bookmarks-lists__name">All</span>
              <span className="bookmarks-lists__count">{total}</span>
            </button>
          </li>

          {lists.map((list) => (
            <li key={list.id} className="bookmarks-lists__row">
              {renamingId === list.id ? (
                <ListNameInput
                  initialValue={list.name}
                  label={`Rename ${list.name}`}
                  onCommit={(name) => {
                    setRenamingId(null)
                    onRename(list, name)
                  }}
                  onCancel={() => setRenamingId(null)}
                />
              ) : (
                <>
                  <button
                    type="button"
                    className="bookmarks-lists__item"
                    aria-pressed={activeId === list.id}
                    onClick={() => onSelect(list.id)}
                  >
                    <span className="bookmarks-lists__name">{list.name}</span>
                    <span className="bookmarks-lists__count">{counts.get(list.id) ?? 0}</span>
                  </button>
                  <div className="bookmarks-lists__actions">
                    <button
                      type="button"
                      className="bookmarks-lists__action"
                      aria-label={`Rename ${list.name}`}
                      title="Rename"
                      onClick={() => setRenamingId(list.id)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="bookmarks-lists__action bookmarks-lists__action--danger"
                      aria-label={`Delete ${list.name}`}
                      title="Delete"
                      onClick={() => onDelete(list)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}

          {creating && (
            <li className="bookmarks-lists__row">
              <ListNameInput
                label="New list name"
                onCommit={(name) => {
                  setCreating(false)
                  onCreate(name)
                }}
                onCancel={() => setCreating(false)}
              />
            </li>
          )}
        </ul>

        {lists.length === 0 && !creating && (
          <p className="bookmarks-lists__hint">Use + to make a list, then pick it when adding a save.</p>
        )}
      </EditableSurface>
    </EditableBox>
  )
}

export default memo(BookmarkLists)
