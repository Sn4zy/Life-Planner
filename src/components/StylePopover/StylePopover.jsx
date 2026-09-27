import { useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import useAssetUrl from '../../hooks/useAssetUrl.js'
import useEditMode from '../../hooks/useEditMode.js'
import useThemeOverrides from '../../hooks/useThemeOverrides.js'
import { deleteAsset, saveAsset } from '../../lib/assets.js'
import './StylePopover.css'

const popoverMotion = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.97 },
  transition: { type: 'spring', stiffness: 380, damping: 30 },
}

function discardAsset(assetId) {
  if (assetId) deleteAsset(assetId).catch(() => {})
}

function ColorField({ label, value, fallback, onChange, onClear }) {
  const inputId = useId()
  return (
    <div className="style-popover__field">
      <label htmlFor={inputId}>{label}</label>
      <div className="style-popover__control">
        <input
          id={inputId}
          className="style-popover__swatch"
          type="color"
          value={value ?? fallback}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="style-popover__value">{value ?? 'Default'}</span>
        <button type="button" className="style-popover__text-btn" disabled={!value} onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  )
}

function StylePopoverPanel({ selection, onClose }) {
  const { overrides, setOverride, clearOverride } = useThemeOverrides()
  const override = overrides[selection.id] ?? {}
  const imageUrl = useAssetUrl(override.backgroundImage)
  const opacityId = useId()
  const [imageBusy, setImageBusy] = useState(false)
  const [error, setError] = useState('')
  const opacity = override.opacity ?? 1

  const update = (patch) => setOverride(selection.id, patch)

  const replaceImage = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('That file isn’t an image.')
      return
    }
    setImageBusy(true)
    setError('')
    try {
      const previous = override.backgroundImage
      update({ backgroundImage: await saveAsset(file) })
      discardAsset(previous)
    } catch (saveError) {
      setError(saveError?.message || 'Couldn’t store that image.')
    }
    setImageBusy(false)
  }

  const removeImage = () => {
    discardAsset(override.backgroundImage)
    update({ backgroundImage: undefined })
  }

  const resetElement = () => {
    discardAsset(override.backgroundImage)
    clearOverride(selection.id)
  }

  return (
    <motion.aside
      className="style-popover glass"
      data-edit-inspector
      aria-label={`Style controls for ${selection.label}`}
      {...popoverMotion}
    >
      <header className="style-popover__header">
        <div>
          <p className="eyebrow">Editing</p>
          <h2 className="style-popover__title">{selection.label}</h2>
        </div>
        <button type="button" className="style-popover__close" aria-label="Close style controls" onClick={onClose}>
          ×
        </button>
      </header>

      <ColorField
        label="Background"
        value={override.backgroundColor}
        fallback="#16161b"
        onChange={(color) => update({ backgroundColor: color })}
        onClear={() => update({ backgroundColor: undefined })}
      />
      <ColorField
        label="Text"
        value={override.color}
        fallback="#ffffff"
        onChange={(color) => update({ color })}
        onClear={() => update({ color: undefined })}
      />

      <div className="style-popover__field">
        <label htmlFor={opacityId}>
          Opacity <span className="style-popover__value">{Math.round(opacity * 100)}%</span>
        </label>
        <input
          id={opacityId}
          className="style-popover__range"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(event) => {
            const next = Number(event.target.value)
            update({ opacity: next === 1 ? undefined : next })
          }}
        />
      </div>

      <div className="style-popover__field">
        <span className="style-popover__label">Background image</span>
        <div className="style-popover__control">
          {imageUrl ? (
            <img className="style-popover__thumb" src={imageUrl} alt="" />
          ) : (
            <span className="style-popover__thumb style-popover__thumb--empty" aria-hidden="true" />
          )}
          <label className={`style-popover__file${imageBusy ? ' style-popover__file--busy' : ''}`}>
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              disabled={imageBusy}
              onChange={(event) => {
                replaceImage(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            {imageBusy ? 'Saving…' : override.backgroundImage ? 'Replace' : 'Choose'}
          </label>
          <button
            type="button"
            className="style-popover__text-btn"
            disabled={!override.backgroundImage}
            onClick={removeImage}
          >
            Remove
          </button>
        </div>
        {error && <p className="style-popover__error" role="alert">{error}</p>}
      </div>

      <p className="style-popover__hint">
        Drag <strong>Move</strong> to reposition, pull the white handles to resize, and click dashed text to rewrite it.
      </p>

      <footer className="style-popover__footer">
        <button type="button" className="style-popover__text-btn" onClick={resetElement}>
          Reset element
        </button>
        <button type="button" className="style-popover__done" onClick={onClose}>
          Done
        </button>
      </footer>
    </motion.aside>
  )
}

export default function StylePopover() {
  const { selected, select } = useEditMode()

  return createPortal(
    <AnimatePresence>
      {selected && (
        <StylePopoverPanel key={selected.id} selection={selected} onClose={() => select(null)} />
      )}
    </AnimatePresence>,
    document.body,
  )
}
