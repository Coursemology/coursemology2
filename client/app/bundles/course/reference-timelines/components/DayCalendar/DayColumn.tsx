import { CSSProperties, memo } from 'react';
import { areEqual } from 'react-window';
import { Typography } from '@mui/material';

import moment from 'lib/moment';

import { getSecondsFromDays, isToday, isWeekend } from '../../utils';

interface DayProps {
  index: number;
  style: CSSProperties;
}

const DayColumn = (props: DayProps): JSX.Element => {
  const day = moment.unix(getSecondsFromDays(props.index));

  return (
    <div
      key={day.toString()}
      className={`select-none rounded-t-lg ${
        isWeekend(day) ? 'bg-neutral-50' : ''
      } ${isToday(day) ? 'bg-red-50' : ''}`}
      style={props.style}
    >
      <div
        className={`sticky top-0 z-20 flex h-20 shrink-0 flex-col justify-end bg-slot-1 slot-1-white ${
          isWeekend(day) ? 'slot-1-neutral-50' : ''
        } ${isToday(day) ? 'slot-1-red-50' : ''}`}
      >
        <div className="flex w-full flex-col items-center">
          <Typography className="text-neutral-400" variant="caption">
            {day.format('dd')}
          </Typography>

          <Typography className="text-neutral-500" variant="subtitle1">
            {day.format('D')}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default memo(DayColumn, areEqual);
