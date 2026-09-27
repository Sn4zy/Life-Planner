import { memo } from 'react'
import { motion } from 'framer-motion'
import BlobImage from '../../components/BlobImage/BlobImage.jsx'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import useEditMode from '../../hooks/useEditMode.js'
import { revealVariants, staggerDelay } from '../../lib/motion.js'

const cardExit = { opacity: 0, scale: 0.94, transition: { duration: 0.25 } }
const cardHover = { y: -4, transition: { type: 'spring', stiffness: 360, damping: 28 } }

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  )
}

function BookmarkCard({ bookmark, index, onEdit }) {
  const { id, name, url, note, image } = bookmark
  const { isEditing } = useEditMode()

  return (
    <motion.div
      className="bookmarks__cell"
      custom={staggerDelay(index)}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      exit={cardExit}
      viewport={{ once: true, amount: 0.3 }}
    >
      <EditableBox id={`bookmarks.card.${id}`} label={`${name} card`} className="bookmarks__editable">
        <EditableSurface
          as={motion.article}
          className="bookmark-card glass"
          whileHover={isEditing ? undefined : cardHover}
        >
          <div className="bookmark-card__media">
            {image ? (
              <BlobImage blob={image} className="bookmark-card__image" />
            ) : (
              <span className="bookmark-card__placeholder" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="bookmark-card__body">
            <h2 className="bookmark-card__title">
              {url ? (
                <a className="bookmark-card__link" href={url} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              ) : (
                name
              )}
            </h2>
            {note && <p className="bookmark-card__note">{note}</p>}
          </div>

          <button
            type="button"
            className="bookmark-card__edit"
            aria-label={`Edit ${name}`}
            onClick={() => onEdit(id)}
          >
            <PencilIcon />
          </button>
        </EditableSurface>
      </EditableBox>
    </motion.div>
  )
}

export default memo(BookmarkCard)
