import * as React from 'react';
import { useState } from 'react';
import { DateTime } from 'luxon';

export const Clock = () => {
  
  const [now, setNow] = useState(DateTime.local());

  React.useEffect(() => {
    setInterval(() => {
      setNow(DateTime.local());
    }, 1000);
  }, []);

  console.log('clock re-rendered');

  return (
    <div className="clock">
      <div className="time">{`${now.toFormat('HH:mm')}`}</div>
      <div className="date text-muted">{`${now.toFormat('EEEE')}, ${now.toLocaleString(DateTime.DATE_FULL)}`}</div>
    </div>
  );
}
