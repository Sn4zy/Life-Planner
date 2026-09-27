import { useContext } from 'react'
import { EditableBoxContext } from '../../context/EditableBoxContext.js'

// Marks the element that visually *is* the box (usually its glass panel), so background,
// text color and opacity overrides land on it rather than on an outer wrapper.
export default function EditableSurface({ as: Component = 'div', className = '', style, ...props }) {
  const box = useContext(EditableBoxContext)
  if (!box) return <Component className={className} style={style} {...props} />

  const { surfaceProps } = box
  return (
    <Component
      {...props}
      className={`${className} ${surfaceProps.className}`.trim()}
      style={{ ...style, ...surfaceProps.style }}
    />
  )
}
