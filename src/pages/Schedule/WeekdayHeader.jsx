import { memo } from 'react'
import { WEEKDAYS, getColorValue } from './scheduleConstants.js'

function WeekdayHeader({ weekday, templateEntries, isToday, onSelect }) {
  const { long, short } = WEEKDAYS[weekday]
  const hasTemplate = templateEntries.length > 0

  return (
    <button
      type="button"
      className={`schedule-weekday${isToday ? ' schedule-weekday--today' : ''}`}
      aria-label={`Set recurring entries for every ${long}${
        hasTemplate ? ` (currently ${templateEntries.map((entry) => entry.label).join(' and ')})` : ''
      }`}
      onClick={() => onSelect(weekday)}
    >
      <span className="schedule-weekday__long">{long}</span>
      <span className="schedule-weekday__short">{short}</span>
      {hasTemplate && (
        <span className="schedule-weekday__dots" aria-hidden="true">
          {templateEntries.map((entry) => (
            <span
              key={entry.id}
              className="schedule-weekday__dot"
              style={{ '--entry-color': getColorValue(entry.color) }}
            />
          ))}
        </span>
      )}
    </button>
  )
}

export default memo(WeekdayHeader)
