import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import { Button, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import translations from '../../translations';
import {
  DAY_WIDTH_PIXELS,
  getDaysFromSeconds,
  getSecondsFromDays,
} from '../../utils';

import DayColumn from './DayColumn';

/**
 * Exact maximum days supported by ECMAScript Date objects.
 *
 * See https://262.ecma-international.org/5.1/#sec-15.9.1.1
 */
const MAX_DAYS = 100_000_000 as const;

interface DayCalendarProps {
  className?: string;
  onScroll?: (offset: number) => void;
}

export interface DayCalendarRef {
  scrollTo: (offset: number) => void;
  scrollToItem: (index: number) => void;
}

const DayCalendar = forwardRef<DayCalendarRef, DayCalendarProps>(
  (props, ref): JSX.Element => {
    const { t } = useTranslation();

    const calendarRef = useRef<List>(null);

    useImperativeHandle(ref, () => ({
      scrollTo: (offset): void => {
        if (calendarRef.current) calendarRef.current.scrollTo(offset);
      },
      scrollToItem: (index): void => {
        if (calendarRef.current)
          calendarRef.current.scrollToItem(index, 'start');
      },
    }));

    const [monthDisplay, setMonthDisplay] = useState(
      moment().format('MMMM YYYY'),
    );

    return (
      <div className={`h-full w-full ${props.className ?? ''}`}>
        <nav className="flex h-16 items-start justify-between px-5">
          <div className="flex items-center justify-center rounded-xl border border-solid border-neutral-200 px-3">
            <Typography variant="subtitle1">{monthDisplay}</Typography>
          </div>

          <Button
            onClick={(): void => {
              const todayIndex =
                getDaysFromSeconds(moment().startOf('day').unix()) + 1;

              calendarRef.current?.scrollToItem(todayIndex, 'center');
            }}
            size="small"
            variant="outlined"
          >
            {t(translations.today)}
          </Button>
        </nav>

        <AutoSizer>
          {({ height, width }): JSX.Element => (
            <List
              ref={calendarRef}
              height={height ?? 0}
              initialScrollOffset={
                getDaysFromSeconds(moment().unix()) * DAY_WIDTH_PIXELS
              }
              itemCount={MAX_DAYS}
              itemSize={DAY_WIDTH_PIXELS}
              layout="horizontal"
              onItemsRendered={({ visibleStartIndex }): void => {
                const visibleStartDay = moment.unix(
                  getSecondsFromDays(visibleStartIndex),
                );

                setMonthDisplay(visibleStartDay.format('MMMM YYYY'));
              }}
              onScroll={({ scrollOffset }): void =>
                props.onScroll?.(scrollOffset)
              }
              overscanCount={5}
              width={width ?? 0}
            >
              {DayColumn}
            </List>
          )}
        </AutoSizer>
      </div>
    );
  },
);

DayCalendar.displayName = 'DayCalendar';

export default DayCalendar;
