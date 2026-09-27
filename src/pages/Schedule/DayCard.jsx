import { Fragment, memo } from 'react'
import { motion } from 'framer-motion'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import { staggerDelay, subtleRevealVariants } from '../../lib/motion.js'
import { WEEKDAYS, getColorValue } from './scheduleConstants.js'
import { formatGap, formatTimeRange } from './scheduleUtils.js'

function DayCard({ day, isToday, isPast, onSelect }) {
  const { iso, weekday, dayOfMonth, monthLabel, entries, gapMinutes, summary, isOverride } = day
  const showMonth = dayOfMonth === 1 || weekday === 0
  const { long, short } = WEEKDAYS[weekday]

  const classes = ['schedule-day', 'glass']
  if (isToday) classes.push('schedule-day--today')
  if (isPast) classes.push('schedule-day--past')

  return (
    <motion.div
      className="schedule-day-reveal"
      custom={staggerDelay(weekday, 0.05)}
      variants={subtleRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <EditableBox id={`schedule.day.${short.toLowerCase()}`} label={`${long} card`} className="schedule-day-box">
        <EditableSurface
          as="button"
          type="button"
          className={classes.join(' ')}
          title={summary || undefined}
          aria-label={`${long} ${monthLabel} ${dayOfMonth}: ${summary || 'nothing scheduled'}. Edit this date.`}
          onClick={() => onSelect(iso)}
        >
          <span className="schedule-day__head">
            <span className="schedule-day__date">
              <span className="schedule-day__number">{dayOfMonth}</span>
              {showMonth && <span className="schedule-day__month">{monthLabel}</span>}
            </span>
            {isOverride && <span className="schedule-day__override">edited</span>}
          </span>

          {entries.length > 0 ? (
            <span className="schedule-day__entries">
              {entries.map((entry, index) => (
                <Fragment key={entry.id}>
                  {index === 1 && gapMinutes !== null && (
                    <span className="schedule-day__gap">{formatGap(gapMinutes)}</span>
                  )}
                  <span
                    className="schedule-entry"
                    style={{ '--entry-color': getColorValue(entry.color) }}
                  >
                    <span className="schedule-entry__label">{entry.label}</span>
                    {(entry.start || entry.end) && (
                      <span className="schedule-entry__time">{formatTimeRange(entry)}</span>
                    )}
                  </span>
                </Fragment>
              ))}
            </span>
          ) : (
            <span className="schedule-day__empty" aria-hidden="true">+</span>
          )}
        </EditableSurface>
      </EditableBox>
    </motion.div>
  )
}

export default memo(DayCard)
