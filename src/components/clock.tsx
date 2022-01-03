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

  return (
    <>
      <h1>{`${now.toFormat('HH:mm')}`}</h1>
      <h5 className="text-muted">{`${now.toFormat('EEEE')}, ${now.toLocaleString(DateTime.DATE_FULL)}`}</h5>
    </>
  );
}
