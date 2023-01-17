import { Fragment } from 'react';
import {
  ItemWithTimeData,
  TimelineData,
} from 'types/course/referenceTimelines';

import { useAppSelector } from 'lib/hooks/store';

import RowSpacer from '../RowSpacer';

import AssignableTimeline from './AssignableTimeline';
import AssignedTimeline from './AssignedTimeline';

/**
 * Maximum inner width of the calendar view. It is essentially equals to
 * `MAX_DAYS` times `DAY_WIDTH_PIXELS`.
 */
const MAX_CALENDAR_INNER_WIDTH_PIXELS = '3e+09px' as const;

interface TimeBarsProps {
  for: ItemWithTimeData[];
  within: TimelineData[];
}

const TimelinesStack = (props: TimeBarsProps): JSX.Element => {
  const { for: items, within: timelines } = props;
  const gamified = useAppSelector((state) => state.timelines.gamified);
  const defaultTimelineId = useAppSelector(
    (state) => state.timelines.defaultTimeline,
  );

  return (
    <div
      className="relative space-y-[1px]"
      style={{ width: MAX_CALENDAR_INNER_WIDTH_PIXELS }}
    >
      {items.map((item) => {
        const defaultTime = item.times[defaultTimelineId];

        return (
          <Fragment key={item.id}>
            {timelines.map((timeline) => {
              const time = item.times[timeline.id];

              return time ? (
                <AssignedTimeline
                  key={timeline.id}
                  for={item}
                  gamified={gamified}
                  in={timeline}
                  visualising={time}
                />
              ) : (
                <AssignableTimeline
                  key={timeline.id}
                  basedOn={defaultTime}
                  for={item}
                  gamified={gamified}
                  in={timeline}
                />
              );
            })}

            <RowSpacer />
          </Fragment>
        );
      })}
    </div>
  );
};

export default TimelinesStack;
