import { useId, useState } from 'react'
import { MAX_ENTRIES_PER_DAY, PALETTE } from './scheduleConstants.js'
import { createId, crossesMidnight, formatDuration, getDurationMinutes } from './scheduleUtils.js'
import './ScheduleEntryForm.css'

function blankEntry(takenColors = []) {
  const color = PALETTE.find((option) => !takenColors.includes(option.id)) ?? PALETTE[0]
  return { id: createId(), label: '', color: color.id, start: '', end: '' }
}

function validate(rows) {
  const errors = {}
  for (const row of rows) {
    if (!row.label) {
      errors[row.id] = 'Give this entry a label.'
    } else if (row.start && row.end && row.start === row.end) {
      errors[row.id] = 'Start and end times can’t be the same.'
    }
  }
  return errors
}

export default function ScheduleEntryForm({
  titleId,
  title,
  hint,
  initialEntries,
  onSave,
  onCancel,
  onReset,
}) {
  const formId = useId()
  const [rows, setRows] = useState(() =>
    initialEntries.length ? initialEntries.map((entry) => ({ ...entry })) : [blankEntry()],
  )
  const [errors, setErrors] = useState({})

  const clearError = (id) =>
    setErrors((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
    clearError(id)
  }

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id))
    clearError(id)
  }

  const addRow = () =>
    setRows((prev) => [...prev, blankEntry(prev.map((row) => row.color))])

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleaned = rows.map(({ id, label, color, start, end }) => ({
      id,
      label: label.trim(),
      color,
      start,
      end,
    }))
    const nextErrors = validate(cleaned)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSave(cleaned)
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit} noValidate>
      <header className="entry-form__header">
        <h2 id={titleId} className="entry-form__title">{title}</h2>
        {hint && <p className="entry-form__hint">{hint}</p>}
      </header>

      {rows.map((row, index) => {
        const fieldId = `${formId}-${row.id}`
        const error = errors[row.id]

        return (
          <fieldset key={row.id} className="entry-form__row">
            <legend className="entry-form__legend eyebrow">Entry {index + 1}</legend>
            <button
              type="button"
              className="entry-form__remove"
              aria-label={`Remove entry ${index + 1}`}
              onClick={() => removeRow(row.id)}
            >
              ×
            </button>

            <label className="visually-hidden" htmlFor={`${fieldId}-label`}>Label</label>
            <input
              id={`${fieldId}-label`}
              className="entry-form__input"
              type="text"
              placeholder="Label, e.g. Uni"
              maxLength={24}
              value={row.label}
              autoFocus={index === 0}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${fieldId}-error` : undefined}
              onChange={(event) => updateRow(row.id, { label: event.target.value })}
            />

            <div className="entry-form__swatches" role="radiogroup" aria-label="Color">
              {PALETTE.map((option) => (
                <label
                  key={option.id}
                  className="entry-form__swatch"
                  style={{ '--swatch': option.value }}
                  title={option.name}
                >
                  <input
                    type="radio"
                    className="visually-hidden"
                    name={`${fieldId}-color`}
                    value={option.id}
                    checked={row.color === option.id}
                    onChange={() => updateRow(row.id, { color: option.id })}
                  />
                  <span className="visually-hidden">{option.name}</span>
                </label>
              ))}
            </div>

            <div className="entry-form__times">
              <label className="entry-form__time">
                <span>Start</span>
                <input
                  className="entry-form__input"
                  type="time"
                  value={row.start}
                  onChange={(event) => updateRow(row.id, { start: event.target.value })}
                />
              </label>
              <label className="entry-form__time">
                <span>End</span>
                <input
                  className="entry-form__input"
                  type="time"
                  value={row.end}
                  onChange={(event) => updateRow(row.id, { end: event.target.value })}
                />
              </label>
            </div>

            {crossesMidnight(row) && (
              <p className="entry-form__hint">
                Ends the next day · {formatDuration(getDurationMinutes(row))}
              </p>
            )}

            {error && (
              <p id={`${fieldId}-error`} className="entry-form__error" role="alert">
                {error}
              </p>
            )}
          </fieldset>
        )
      })}

      {rows.length === 0 && (
        <p className="entry-form__empty">No entries. Saving will leave this empty.</p>
      )}

      {rows.length < MAX_ENTRIES_PER_DAY && (
        <button type="button" className="entry-form__add" onClick={addRow}>
          + Add {rows.length ? 'second ' : ''}entry
        </button>
      )}

      <footer className="entry-form__footer">
        {onReset && (
          <button type="button" className="entry-form__reset" onClick={onReset}>
            Revert to weekly default
          </button>
        )}
        <div className="entry-form__actions">
          <button type="button" className="entry-form__btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="entry-form__btn entry-form__btn--primary">
            Save
          </button>
        </div>
      </footer>
    </form>
  )
}
