import { useCallback, useId, useMemo, useState } from 'react'
import EditableBox from '../../components/EditableBox/EditableBox.jsx'
import EditableSurface from '../../components/EditableBox/EditableSurface.jsx'
import EditableText from '../../components/EditableBox/EditableText.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import DayCard from './DayCard.jsx'
import ScheduleEntryForm from './ScheduleEntryForm.jsx'
import WeekdayHeader from './WeekdayHeader.jsx'
import useWeekSchedule from './useWeekSchedule.js'
import { WEEKDAYS, getColorValue } from './scheduleConstants.js'
import {
  currentWeekStartISO,
  formatLongDate,
  formatWeekRange,
  shiftWeekISO,
  todayISO,
} from './scheduleUtils.js'
import './Schedule.css'

function ChevronIcon({ direction }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  )
}

export default function Schedule() {
  const [weekStart, setWeekStart] = useState(currentWeekStartISO)
  const [editing, setEditing] = useState(null)
  const { days, currentTemplates, setTemplate, setOverride, clearOverride } =
    useWeekSchedule(weekStart)
  const formTitleId = useId()

  const today = todayISO()
  const isCurrentWeek = weekStart === currentWeekStartISO()

  const legend = useMemo(() => {
    const seen = new Map()
    for (const day of days) {
      for (const entry of day.entries) {
        const key = `${entry.label.toLowerCase()}|${entry.color}`
        if (!seen.has(key)) seen.set(key, entry)
      }
    }
    return [...seen.entries()].map(([key, entry]) => ({ key, label: entry.label, color: entry.color }))
  }, [days])

  const goToPreviousWeek = useCallback(() => setWeekStart((week) => shiftWeekISO(week, -1)), [])
  const goToNextWeek = useCallback(() => setWeekStart((week) => shiftWeekISO(week, 1)), [])
  const goToThisWeek = useCallback(() => setWeekStart(currentWeekStartISO()), [])

  const editTemplate = useCallback((weekday) => setEditing({ kind: 'template', weekday }), [])
  const editDate = useCallback((iso) => setEditing({ kind: 'date', iso }), [])
  const closeEditor = useCallback(() => setEditing(null), [])

  let form = null
  if (editing?.kind === 'template') {
    const { weekday } = editing
    form = (
      <ScheduleEntryForm
        key={`template-${weekday}`}
        titleId={formTitleId}
        title={`Every ${WEEKDAYS[weekday].long}`}
        hint="Repeats from today onward. Past dates and edited dates keep what they have."
        initialEntries={currentTemplates[weekday]}
        onCancel={closeEditor}
        onSave={(entries) => {
          setTemplate(weekday, entries)
          closeEditor()
        }}
      />
    )
  } else if (editing?.kind === 'date') {
    const day = days.find((candidate) => candidate.iso === editing.iso)
    if (day) {
      form = (
        <ScheduleEntryForm
          key={`date-${day.iso}`}
          titleId={formTitleId}
          title={formatLongDate(day.iso)}
          hint={`Only changes this date. Your ${WEEKDAYS[day.weekday].long} default stays the same.`}
          initialEntries={day.entries}
          onCancel={closeEditor}
          onSave={(entries) => {
            setOverride(day.iso, entries)
            closeEditor()
          }}
          onReset={
            day.isOverride
              ? () => {
                  clearOverride(day.iso)
                  closeEditor()
                }
              : undefined
          }
        />
      )
    }
  }

  return (
    <section className="schedule">
      <header className="schedule__header">
        <div className="schedule__heading">
          <p className="eyebrow">Week of</p>
          <h1 className="schedule__title">{formatWeekRange(weekStart)}</h1>
        </div>

        <div className="schedule__controls">
          <button
            type="button"
            className="schedule__today"
            onClick={goToThisWeek}
            disabled={isCurrentWeek}
          >
            This week
          </button>
          <button
            type="button"
            className="schedule__arrow"
            aria-label="Previous week"
            onClick={goToPreviousWeek}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            className="schedule__arrow"
            aria-label="Next week"
            onClick={goToNextWeek}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </header>

      <div className="schedule__scroller">
        <div className="schedule__grid">
          {days.map((day) => (
            <WeekdayHeader
              key={`header-${day.weekday}`}
              weekday={day.weekday}
              templateEntries={currentTemplates[day.weekday]}
              isToday={day.iso === today}
              onSelect={editTemplate}
            />
          ))}
          {days.map((day) => (
            <DayCard
              key={day.iso}
              day={day}
              isToday={day.iso === today}
              isPast={day.iso < today}
              onSelect={editDate}
            />
          ))}
        </div>
      </div>

      <EditableBox id="schedule.legend" label="Legend" className="schedule-legend-box">
        <EditableSurface as="aside" className="schedule-legend glass" aria-label="Legend">
          <EditableText id="schedule.legend.title" className="eyebrow">Legend</EditableText>
          {legend.length ? (
            <ul className="schedule-legend__list">
              {legend.map((item) => (
                <li key={item.key} className="schedule-legend__item">
                  <span
                    className="schedule-legend__dot"
                    style={{ '--entry-color': getColorValue(item.color) }}
                    aria-hidden="true"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="schedule-legend__empty">
              Nothing scheduled this week. Click a weekday to set a recurring entry, or a date to plan just that day.
            </p>
          )}
        </EditableSurface>
      </EditableBox>

      <Modal
        open={form !== null}
        onClose={closeEditor}
        labelledBy={formTitleId}
        editableId="schedule.form"
        editableLabel="Schedule form"
      >
        {form}
      </Modal>
    </section>
  )
}
