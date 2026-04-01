import {
  mergeLocalDatetime,
  splitLocalDatetime,
} from '../utils/datetime';

/**
 * Separate date + time pickers (often easier than one datetime-local control).
 */
export function DateTimeFields({
  legend,
  value,
  onChange,
  idPrefix = 'dt',
  required,
  timeStep = 300,
  dateLabel = 'Date',
  timeLabel = 'Time',
}) {
  const { date, time } = splitLocalDatetime(value);
  const labelId = `${idPrefix}-legend`;

  function onDate(e) {
    onChange(mergeLocalDatetime(e.target.value, time));
  }

  function onTime(e) {
    onChange(mergeLocalDatetime(date, e.target.value));
  }

  return (
    <div
      className="datetime-fields"
      role="group"
      aria-labelledby={legend ? labelId : undefined}
    >
      {legend ? (
        <div id={labelId} className="datetime-fields-legend">
          {legend}
        </div>
      ) : null}
      <div className="datetime-fields-row">
        <label className="field datetime-field">
          <span>{dateLabel}</span>
          <input
            type="date"
            id={`${idPrefix}-date`}
            value={date}
            onChange={onDate}
            required={required}
          />
        </label>
        <label className="field datetime-field">
          <span>{timeLabel}</span>
          <input
            type="time"
            id={`${idPrefix}-time`}
            value={time}
            onChange={onTime}
            required={required}
            step={timeStep}
          />
        </label>
      </div>
    </div>
  );
}
