import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { EditableBoxContext } from '../../context/EditableBoxContext.js'
import useAssetUrl from '../../hooks/useAssetUrl.js'
import useEditMode from '../../hooks/useEditMode.js'
import useThemeOverrides from '../../hooks/useThemeOverrides.js'
import './EditableBox.css'

const MIN_SIZE = 60
const GESTURES = {
  move: { type: 'move' },
  e: { type: 'resize', x: true, y: false },
  s: { type: 'resize', x: false, y: true },
  se: { type: 'resize', x: true, y: true },
}
const IMAGE_SCRIM = 'linear-gradient(rgb(0 0 0 / 0.3), rgb(0 0 0 / 0.3))'

const ARROW_DELTAS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

const hasSize = (override) => override?.width != null || override?.height != null
const hasLayout = (override) => Boolean(override && (override.x || override.y || hasSize(override)))

function buildFrameStyle(override, isOverlay) {
  if (!hasLayout(override)) return undefined
  const { x, y, width, height } = override
  const style = {}

  if (x || y) style.transform = `translate(${x ?? 0}px, ${y ?? 0}px)`
  if (hasSize(override)) {
    const fallback = isOverlay ? '100%' : undefined
    style.width = width ?? fallback
    style.height = height ?? fallback
  }
  return style
}

function buildSurfaceProps(override, imageUrl, { outlined, selected }) {
  const classes = ['edit-surface']
  const style = {}

  if (override?.color) style.color = override.color
  if (override?.opacity != null) style.opacity = override.opacity
  if (override?.backgroundColor || imageUrl) {
    classes.push('edit-surface--has-bg')
    style['--surface-bg-color'] = override.backgroundColor || 'transparent'
    style['--surface-bg-image'] = imageUrl ? `${IMAGE_SCRIM}, url("${imageUrl}")` : 'none'
  }
  if (imageUrl) classes.push('edit-surface--has-image')
  if (outlined) classes.push('edit-surface--editing')
  if (selected) classes.push('edit-surface--selected')

  return { className: classes.join(' '), style }
}

export default function EditableBox({
  id,
  label = id,
  className = '',
  resizeMode = 'flow',
  movable = true,
  resizable = true,
  clickToSelect = true,
  passThrough = false,
  children,
}) {
  const parentBox = useContext(EditableBoxContext)
  const { isEditing, selected, select, deselect } = useEditMode()
  const { overrides, setOverride } = useThemeOverrides()
  const override = overrides[id]
  const imageUrl = useAssetUrl(override?.backgroundImage)

  const rootRef = useRef(null)
  const frameRef = useRef(null)
  const gestureRef = useRef(null)
  const pendingPatchRef = useRef(null)
  const frameRequestRef = useRef(0)
  const [isInteracting, setInteracting] = useState(false)

  const isSelected = selected?.id === id
  const canMove = movable && !parentBox
  const isOverlay = resizeMode === 'overlay'
  const outlined = isEditing && clickToSelect

  const surfaceProps = useMemo(
    () => buildSurfaceProps(override, imageUrl, { outlined, selected: isSelected }),
    [override, imageUrl, outlined, isSelected],
  )
  const contextValue = useMemo(() => ({ id, surfaceProps }), [id, surfaceProps])

  const flushPatch = useCallback(() => {
    cancelAnimationFrame(frameRequestRef.current)
    frameRequestRef.current = 0
    const patch = pendingPatchRef.current
    pendingPatchRef.current = null
    if (patch) setOverride(id, patch)
  }, [id, setOverride])

  const queuePatch = useCallback(
    (patch) => {
      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch }
      if (!frameRequestRef.current) frameRequestRef.current = requestAnimationFrame(flushPatch)
    },
    [flushPatch],
  )

  useEffect(() => () => cancelAnimationFrame(frameRequestRef.current), [])

  useEffect(() => () => deselect(id), [id, deselect])

  const measure = () => ({
    x: override?.x ?? 0,
    y: override?.y ?? 0,
    width: override?.width ?? frameRef.current.offsetWidth,
    height: override?.height ?? frameRef.current.offsetHeight,
  })

  // Innermost box wins: outer boxes ignore clicks that land inside a nested box.
  // passThrough boxes (forms, editors) still let the click reach their controls.
  const handleClickCapture = (event) => {
    if (!isEditing || !clickToSelect) return
    const { target } = event
    if (!(target instanceof Element) || target.closest('[data-edit-ignore]')) return
    if (target.closest('.editable-box') !== rootRef.current) return
    if (!passThrough) {
      event.preventDefault()
      event.stopPropagation()
    }
    select(id, label)
  }

  const beginGesture = (event) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureRef.current = {
      kind: GESTURES[event.currentTarget.dataset.gesture],
      originX: event.clientX,
      originY: event.clientY,
      start: measure(),
    }
    setInteracting(true)
  }

  const updateGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture) return
    const dx = event.clientX - gesture.originX
    const dy = event.clientY - gesture.originY
    const { kind, start } = gesture

    if (kind.type === 'move') {
      queuePatch({ x: Math.round(start.x + dx), y: Math.round(start.y + dy) })
      return
    }
    const patch = {}
    if (kind.x) patch.width = Math.max(MIN_SIZE, Math.round(start.width + dx))
    if (kind.y) patch.height = Math.max(MIN_SIZE, Math.round(start.height + dy))
    queuePatch(patch)
  }

  const endGesture = () => {
    if (!gestureRef.current) return
    gestureRef.current = null
    flushPatch()
    setInteracting(false)
  }

  const handleKeyboardNudge = (event) => {
    const delta = ARROW_DELTAS[event.key]
    if (!delta) return
    event.preventDefault()
    const step = event.shiftKey ? 10 : 1
    const dx = delta[0] * step
    const dy = delta[1] * step
    const current = measure()

    if (event.currentTarget.dataset.gesture === 'move') {
      setOverride(id, { x: current.x + dx, y: current.y + dy })
    } else {
      setOverride(id, {
        width: Math.max(MIN_SIZE, current.width + dx),
        height: Math.max(MIN_SIZE, current.height + dy),
      })
    }
  }

  const classes = [
    'editable-box',
    className,
    isOverlay && 'editable-box--overlay',
    hasSize(override) && 'editable-box--sized',
    hasLayout(override) && 'editable-box--raised',
    isSelected && 'editable-box--selected',
    isInteracting && 'editable-box--active',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className={classes} data-editable-id={id} onClickCapture={handleClickCapture}>
      <div ref={frameRef} className="editable-box__frame" style={buildFrameStyle(override, isOverlay)}>
        <div className="editable-box__content">
          <EditableBoxContext value={contextValue}>{children}</EditableBoxContext>
        </div>

        {isSelected && canMove && (
          <button
            type="button"
            className="editable-box__grip"
            data-gesture="move"
            aria-label={`Move ${label}. Arrow keys nudge, hold Shift for larger steps.`}
            onKeyDown={handleKeyboardNudge}
            onPointerDown={beginGesture}
            onPointerMove={updateGesture}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
          >
            Move
          </button>
        )}

        {isSelected && resizable && (
          <>
            {['e', 's'].map((edge) => (
              <span
                key={edge}
                className={`editable-box__handle editable-box__handle--${edge}`}
                data-gesture={edge}
                aria-hidden="true"
                onPointerDown={beginGesture}
                onPointerMove={updateGesture}
                onPointerUp={endGesture}
                onPointerCancel={endGesture}
              />
            ))}
            <button
              type="button"
              className="editable-box__handle editable-box__handle--se"
              data-gesture="se"
              aria-label={`Resize ${label}. Arrow keys resize, hold Shift for larger steps.`}
              onKeyDown={handleKeyboardNudge}
              onPointerDown={beginGesture}
              onPointerMove={updateGesture}
              onPointerUp={endGesture}
              onPointerCancel={endGesture}
            />
          </>
        )}
      </div>
    </div>
  )
}
