import * as React from 'react';
import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';

type HistoricalEvent = { year: number; text: string };
type EventsByDay = Record<string, HistoricalEvent[]>;

const pickRandom = <T,>(items: T[]): T | undefined => items[Math.floor(Math.random() * items.length)];

const formatYear = (year: number) => (year < 0 ? `${-year} BC` : `${year}`);

export const Clock = () => {
  
  const [now, setNow] = useState(DateTime.local());

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(DateTime.local());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const [eventsByDay, setEventsByDay] = useState<EventsByDay | null>(null);

  // Loaded lazily so the events JSON is emitted as a separate chunk and does not block the first render.
  React.useEffect(() => {
    let active = true;

    import('../data/on-this-day.json')
      .then(module => {
        if (active) setEventsByDay(module.default);
      })
      .catch(() => {
        // Events are optional; the date still displays without a tooltip.
      });

    return () => {
      active = false;
    };
  }, []);

  const dayKey = now.toFormat('MM-dd');
  const event = useMemo(() => pickRandom(eventsByDay?.[dayKey] ?? []), [dayKey, eventsByDay]);
  const tooltip = event ? `${formatYear(event.year)}: ${event.text}` : undefined;

  return (
    <div className="clock">
      <div className="time">{`${now.toFormat('HH:mm')}`}</div>
      <div className="date text-muted" title={tooltip}>{`${now.toFormat('EEEE')}, ${now.toLocaleString(DateTime.DATE_FULL)}`}</div>
    </div>
  );
}
