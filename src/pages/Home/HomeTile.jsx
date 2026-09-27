import { memo } from 'react'
import { motion } from 'framer-motion'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import EditableText from '../../components/EditableBox/EditableText.jsx'
import useEditMode from '../../hooks/useEditMode.js'

const EASE_OUT = [0.22, 1, 0.36, 1]

const revealVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT, delay: index * 0.09 },
  }),
}

const hoverMotion = { y: -6, transition: { duration: 0.3, ease: EASE_OUT } }
const tapMotion = { scale: 0.98 }

function HomeTile({ editableId, index, to, title, description, size, icon, onSelect }) {
  const { isEditing } = useEditMode()

  return (
    <motion.div
      className={`home__cell home__cell--${size}`}
      custom={index}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <EditableBox id={editableId} label={`${title} tile`} className="home__editable" resizeMode="overlay">
        <EditableSurface
          className={`home-tile home-tile--${size} glass`}
          {...(isEditing
            ? { as: motion.div }
            : {
                as: motion.button,
                type: 'button',
                whileHover: hoverMotion,
                whileTap: tapMotion,
                onClick: () => onSelect(to),
              })}
        >
          <div className="home-tile__top">
            <span className="home-tile__icon">{icon}</span>
            <span className="home-tile__index">{String(index + 1).padStart(2, '0')}</span>
          </div>

          <div className="home-tile__bottom">
            <div className="home-tile__text">
              <EditableText id={`${editableId}.title`} as="h2" className="home-tile__title">
                {title}
              </EditableText>
              <EditableText id={`${editableId}.description`} as="p" className="home-tile__description">
                {description}
              </EditableText>
            </div>
            <span className="home-tile__arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </div>
        </EditableSurface>
      </EditableBox>
    </motion.div>
  )
}

export default memo(HomeTile)
