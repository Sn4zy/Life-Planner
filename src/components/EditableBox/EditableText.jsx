import useEditMode from '../../hooks/useEditMode.js'
import useThemeOverrides from '../../hooks/useThemeOverrides.js'

export default function EditableText({ id, as: Tag = 'span', className = '', children: defaultText }) {
  const { isEditing } = useEditMode()
  const { overrides, setOverride } = useThemeOverrides()
  const text = overrides[id]?.text ?? defaultText

  if (!isEditing) return <Tag className={className || undefined}>{text}</Tag>

  const commit = (element) => {
    const next = element.textContent.replace(/\s+/g, ' ').trim()
    setOverride(id, { text: next && next !== defaultText ? next : undefined })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.textContent = text
      event.currentTarget.blur()
    }
  }

  // Keyed by the text so React remounts after a save instead of reconciling DOM the browser edited.
  return (
    <Tag
      key={text}
      className={`${className} editable-text`.trim()}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={`Edit text: ${text}`}
      onBlur={(event) => commit(event.currentTarget)}
      onKeyDown={handleKeyDown}
    >
      {text}
    </Tag>
  )
}
