import { useCallback, useId, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Modal from '../../components/Modal/Modal.jsx'
import useIndexedDB from '../../hooks/useIndexedDB.js'
import useLocalStorage from '../../hooks/useLocalStorage.js'
import BookmarkCard from './BookmarkCard.jsx'
import BookmarkForm from './BookmarkForm.jsx'
import BookmarkLists from './BookmarkLists.jsx'
import { ALL_LISTS, BOOKMARKS_STORE, BOOKMARK_LISTS_STORE, createId } from './bookmarksUtils.js'
import './Bookmarks.css'

export default function Bookmarks() {
  const { items, status, error, putItem, removeItem } = useIndexedDB(BOOKMARKS_STORE)
  const {
    items: listItems,
    putItem: putList,
    removeItem: removeList,
  } = useIndexedDB(BOOKMARK_LISTS_STORE)
  const [activeListId, setActiveListId] = useLocalStorage('bookmarks.activeList', ALL_LISTS)
  const [editor, setEditor] = useState(null)
  const [listError, setListError] = useState('')
  const formTitleId = useId()

  const bookmarks = useMemo(
    () => [...items].sort((a, b) => b.createdAt - a.createdAt),
    [items],
  )

  const lists = useMemo(
    () => [...listItems].sort((a, b) => a.createdAt - b.createdAt),
    [listItems],
  )

  // A remembered list that no longer exists falls back to "All".
  const activeList = lists.find((list) => list.id === activeListId) ?? null

  const listCounts = useMemo(() => {
    const counts = new Map()
    for (const bookmark of bookmarks) {
      if (bookmark.listId) counts.set(bookmark.listId, (counts.get(bookmark.listId) ?? 0) + 1)
    }
    return counts
  }, [bookmarks])

  const visibleBookmarks = useMemo(
    () => (activeList ? bookmarks.filter((bookmark) => bookmark.listId === activeList.id) : bookmarks),
    [bookmarks, activeList],
  )

  const openAddForm = useCallback(() => setEditor({ session: createId(), id: null }), [])
  const openEditForm = useCallback((id) => setEditor({ session: createId(), id }), [])
  const closeForm = useCallback(() => setEditor(null), [])

  const handleAdd = useCallback(
    async (values) => {
      const now = Date.now()
      await putItem({ id: createId(), ...values, createdAt: now, updatedAt: now })
      closeForm()
    },
    [putItem, closeForm],
  )

  const handleEdit = useCallback(
    async (existing, values) => {
      await putItem({ ...existing, ...values, updatedAt: Date.now() })
      closeForm()
    },
    [putItem, closeForm],
  )

  const handleDelete = useCallback(
    async (id) => {
      await removeItem(id)
      closeForm()
    },
    [removeItem, closeForm],
  )

  const runListAction = useCallback(async (action) => {
    setListError('')
    try {
      await action()
    } catch (listFailure) {
      setListError(`Couldn’t update your lists${listFailure?.message ? `: ${listFailure.message}` : '.'}`)
    }
  }, [])

  const handleCreateList = useCallback(
    (name) =>
      runListAction(async () => {
        const list = { id: createId(), name, createdAt: Date.now() }
        await putList(list)
        setActiveListId(list.id)
      }),
    [runListAction, putList, setActiveListId],
  )

  const handleRenameList = useCallback(
    (list, name) => {
      if (name === list.name) return
      runListAction(() => putList({ ...list, name }))
    },
    [runListAction, putList],
  )

  const handleDeleteList = useCallback(
    (list) => {
      const members = items.filter((bookmark) => bookmark.listId === list.id)
      const message = members.length
        ? `Delete the list “${list.name}”? Its ${members.length} save${members.length === 1 ? '' : 's'} will stay in All.`
        : `Delete the list “${list.name}”?`
      if (!window.confirm(message)) return

      runListAction(async () => {
        await Promise.all(members.map((bookmark) => putItem({ ...bookmark, listId: null })))
        await removeList(list.id)
      })
    },
    [items, runListAction, putItem, removeList],
  )

  const editingBookmark = editor?.id ? items.find((item) => item.id === editor.id) : null
  const showForm = editor !== null && (!editor.id || Boolean(editingBookmark))

  return (
    <section className="bookmarks">
      <header className="bookmarks__header">
        <div className="bookmarks__heading">
          <p className="eyebrow">
            {activeList ? activeList.name : 'All saves'}
            {status === 'ready' ? ` · ${visibleBookmarks.length}` : ''}
          </p>
          <h1 className="bookmarks__title">Bookmarks</h1>
        </div>

        <button type="button" className="bookmarks__add" onClick={openAddForm}>
          + Add
        </button>
      </header>

      {status === 'error' && (
        <p className="bookmarks__message glass" role="alert">
          Couldn’t open browser storage, so saves can’t be loaded or kept. {error?.message}
        </p>
      )}
      {listError && (
        <p className="bookmarks__message glass" role="alert">{listError}</p>
      )}

      <div className="bookmarks__body">
        <BookmarkLists
          lists={lists}
          counts={listCounts}
          total={bookmarks.length}
          activeId={activeList?.id ?? null}
          onSelect={setActiveListId}
          onCreate={handleCreateList}
          onRename={handleRenameList}
          onDelete={handleDeleteList}
        />

        <div className="bookmarks__main">
          {status === 'ready' && bookmarks.length === 0 && (
            <div className="bookmarks__empty glass">
              <h2>No saves yet</h2>
              <p>Keep links, art and references here, with an image for each.</p>
              <button type="button" className="bookmarks__add" onClick={openAddForm}>
                + Add your first save
              </button>
            </div>
          )}

          {status === 'ready' && bookmarks.length > 0 && visibleBookmarks.length === 0 && (
            <div className="bookmarks__empty glass">
              <h2>Nothing in {activeList?.name} yet</h2>
              <p>Add a save here, or move an existing one in by picking this list in its edit form.</p>
              <button type="button" className="bookmarks__add" onClick={openAddForm}>
                + Add to this list
              </button>
            </div>
          )}

          {visibleBookmarks.length > 0 && (
            <div className="bookmarks__grid">
              <AnimatePresence>
                {visibleBookmarks.map((bookmark, index) => (
                  <BookmarkCard
                    key={bookmark.id}
                    index={index}
                    bookmark={bookmark}
                    onEdit={openEditForm}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showForm}
        onClose={closeForm}
        labelledBy={formTitleId}
        editableId="bookmarks.form"
        editableLabel="Bookmark form"
      >
        {showForm && (
          <BookmarkForm
            key={editor.session}
            titleId={formTitleId}
            bookmark={editingBookmark}
            lists={lists}
            defaultListId={activeList?.id ?? null}
            onCancel={closeForm}
            onSave={(values) =>
              editingBookmark ? handleEdit(editingBookmark, values) : handleAdd(values)
            }
            onDelete={editingBookmark ? () => handleDelete(editingBookmark.id) : undefined}
          />
        )}
      </Modal>
    </section>
  )
}
