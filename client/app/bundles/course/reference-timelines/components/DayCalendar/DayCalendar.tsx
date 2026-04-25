import {
  forwardRef,
  UIEventHandler,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Grid, GridImperativeAPI } from 'react-window';
import { Button, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import translations from '../../translations';
import { DAY_WIDTH_PIXELS, getSecondsFromDays } from '../../utils';

import DayColumn from './DayColumn';

/**
 * Exact maximum days supported by ECMAScript Date objects.
 *
 * See https://262.ecma-international.org/5.1/#sec-15.9.1.1
 */
const MAX_DAYS = 100_000_000 as const;

interface DayCalendarProps {
  className?: string;
  onScroll?: UIEventHandler<HTMLDivElement>;
  scrollToToday: () => void;
}

export interface DayCalendarRef {
  scrollTo: (offset: number) => void;
  scrollToItem: (index: number) => void;
}

const DayCalendar = forwardRef<DayCalendarRef, DayCalendarProps>(
  (props, ref): JSX.Element => {
    const { t } = useTranslation();

    const calendarRef = useRef<GridImperativeAPI>(null);

    useImperativeHandle(ref, () => ({
      scrollTo: (offset): void => {
        calendarRef.current?.element?.scrollTo({ left: offset });
      },
      scrollToItem: (index): void => {
        calendarRef.current?.scrollToColumn({ index, align: 'start' });
      },
    }));

    const [monthDisplay, setMonthDisplay] = useState(
      moment().format('MMMM YYYY'),
    );

    return (
      <div className={`h-full w-full ${props.className ?? ''}`}>
        <nav className="flex h-16 items-start justify-between px-5 w-full">
          <div className="flex items-center justify-center rounded-xl border border-solid border-neutral-200 px-3">
            <Typography variant="subtitle1">{monthDisplay}</Typography>
          </div>
          <Button
            className="absolute right-5"
            onClick={props.scrollToToday}
            size="small"
            variant="outlined"
          >
            {t(translations.today)}
          </Button>
        </nav>

        <Grid
          cellComponent={DayColumn}
          cellProps={{}}
          className="h-full"
          columnCount={MAX_DAYS}
          columnWidth={DAY_WIDTH_PIXELS}
          gridRef={calendarRef}
          onCellsRendered={({ columnStartIndex }): void => {
            const visibleStartDay = moment.unix(
              getSecondsFromDays(columnStartIndex),
            );

            setMonthDisplay(visibleStartDay.format('MMMM YYYY'));
          }}
          onScroll={(e) => {
            props.onScroll?.(e);
          }}
          overscanCount={5}
          rowCount={1}
          rowHeight="100%"
        />
      </div>
    );
  },
);

DayCalendar.displayName = 'DayCalendar';

export default DayCalendar;
