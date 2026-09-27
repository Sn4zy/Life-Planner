import { useId, useState } from 'react'
import BlobImage from '../../components/BlobImage/BlobImage.jsx'
import { normalizeUrl } from './bookmarksUtils.js'
import './BookmarkForm.css'

const EMPTY_VALUES = { image: null, name: '', url: '', note: '', listId: '' }

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Give this save a name.'
  if (normalizeUrl(values.url) === null) errors.url = 'Enter a valid web address (http or https).'
  return errors
}

export default function BookmarkForm({
  titleId,
  bookmark,
  lists = [],
  defaultListId = null,
  onSave,
  onDelete,
  onCancel,
}) {
  const fieldId = useId()
  const isEditing = Boolean(bookmark)
  const [values, setValues] = useState(() => {
    const preferredListId = bookmark ? bookmark.listId : defaultListId
    const listId = lists.some((list) => list.id === preferredListId) ? preferredListId : ''
    return bookmark
      ? { image: bookmark.image ?? null, name: bookmark.name, url: bookmark.url, note: bookmark.note, listId }
      : { ...EMPTY_VALUES, listId }
  })
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [dragging, setDragging] = useState(false)

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const acceptFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('That file isn’t an image.')
      return
    }
    setImageError('')
    setField('image', file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer.files?.[0])
  }

  const run = async (action) => {
    setPending(true)
    setSubmitError('')
    try {
      await action()
    } catch (error) {
      setSubmitError(error?.message || 'Something went wrong while saving.')
      setPending(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    run(() =>
      onSave({
        image: values.image,
        name: values.name.trim(),
        url: normalizeUrl(values.url),
        note: values.note.trim(),
        listId: values.listId || null,
      }),
    )
  }

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    run(onDelete)
  }

  return (
    <form className="bookmark-form" onSubmit={handleSubmit} noValidate>
      <h2 id={titleId} className="bookmark-form__title">
        {isEditing ? 'Edit save' : 'New save'}
      </h2>

      <div className="bookmark-form__image-field">
        <label
          className={`bookmark-form__dropzone${dragging ? ' bookmark-form__dropzone--dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(event) => {
              acceptFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          {values.image ? (
            <BlobImage blob={values.image} alt="Selected image preview" className="bookmark-form__preview" />
          ) : (
            <span className="bookmark-form__dropzone-text">
              <strong>Choose an image</strong>
              <span>or drop one here</span>
            </span>
          )}
        </label>

        {values.image && (
          <div className="bookmark-form__image-actions">
            <span>Click the image to replace it.</span>
            <button type="button" className="bookmark-form__text-btn" onClick={() => setField('image', null)}>
              Remove image
            </button>
          </div>
        )}
        {imageError && <p className="bookmark-form__error" role="alert">{imageError}</p>}
      </div>

      <div className="bookmark-form__field">
        <label htmlFor={`${fieldId}-name`}>Name</label>
        <input
          id={`${fieldId}-name`}
          className="bookmark-form__input"
          type="text"
          maxLength={80}
          placeholder="e.g. Berserk panel reference"
          value={values.name}
          autoFocus={!isEditing}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
          onChange={(event) => setField('name', event.target.value)}
        />
        {errors.name && (
          <p id={`${fieldId}-name-error`} className="bookmark-form__error" role="alert">{errors.name}</p>
        )}
      </div>

      <div className="bookmark-form__field">
        <label htmlFor={`${fieldId}-url`}>Link <span>(optional)</span></label>
        <input
          id={`${fieldId}-url`}
          className="bookmark-form__input"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={values.url}
          aria-invalid={Boolean(errors.url)}
          aria-describedby={errors.url ? `${fieldId}-url-error` : undefined}
          onChange={(event) => setField('url', event.target.value)}
        />
        {errors.url && (
          <p id={`${fieldId}-url-error`} className="bookmark-form__error" role="alert">{errors.url}</p>
        )}
      </div>

      <div className="bookmark-form__field">
        <label htmlFor={`${fieldId}-note`}>Note <span>(optional)</span></label>
        <textarea
          id={`${fieldId}-note`}
          className="bookmark-form__input bookmark-form__textarea"
          rows={3}
          maxLength={500}
          placeholder="Why you saved it, where it's from…"
          value={values.note}
          onChange={(event) => setField('note', event.target.value)}
        />
      </div>

      {lists.length > 0 && (
        <div className="bookmark-form__field">
          <label htmlFor={`${fieldId}-list`}>List <span>(optional)</span></label>
          <div className="bookmark-form__select-wrap">
            <select
              id={`${fieldId}-list`}
              className="bookmark-form__input bookmark-form__select"
              value={values.listId}
              onChange={(event) => setField('listId', event.target.value)}
            >
              <option value="">No list (only in All)</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {submitError && <p className="bookmark-form__error" role="alert">{submitError}</p>}

      <footer className="bookmark-form__footer">
        {isEditing && (
          <button
            type="button"
            className={`bookmark-form__btn bookmark-form__btn--danger${
              confirmingDelete ? ' bookmark-form__btn--armed' : ''
            }`}
            disabled={pending}
            onClick={handleDelete}
          >
            {confirmingDelete ? 'Confirm delete' : 'Delete'}
          </button>
        )}
        <div className="bookmark-form__actions">
          <button type="button" className="bookmark-form__btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="bookmark-form__btn bookmark-form__btn--primary"
            disabled={pending}
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </footer>
    </form>
  )
}
