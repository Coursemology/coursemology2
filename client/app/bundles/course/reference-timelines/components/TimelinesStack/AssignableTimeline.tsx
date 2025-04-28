import { useState } from 'react';
import {
  ItemWithTimeData,
  TimeData,
  TimelineData,
} from 'types/course/referenceTimelines';

import moment from 'lib/moment';

import { useLastSaved } from '../../contexts';
import { DraftableTimeData } from '../../utils';
import TimePopup from '../TimePopup';

import Timeline from './Timeline';

interface AssignableTimelineProps {
  for: ItemWithTimeData;
  in: TimelineData;
  basedOn: TimeData;
  gamified?: boolean;
}

const AssignableTimeline = (props: AssignableTimelineProps): JSX.Element => {
  const { for: item, in: timeline, basedOn: defaultTime } = props;

  const { status } = useLastSaved();

  const [timeBar, setTimeBar] = useState<HTMLElement | null>();
  const [draftTime, setDraftTime] = useState<DraftableTimeData>();

  return (
    <>
      <Timeline
        canCreate={status !== 'loading'}
        defaultTime={defaultTime}
        onClickShadow={(startTime, target): void => {
          setTimeBar(target);

          const defaultStart = moment(defaultTime.startAt);

          const defaultBonus = defaultTime.bonusEndAt
            ? moment(defaultTime.bonusEndAt)
            : undefined;

          const defaultEnd = defaultTime.endAt
            ? moment(defaultTime.endAt)
            : undefined;

          const deltaStart = startTime
            .startOf('day')
            .diff(defaultStart.clone().startOf('day'), 'days');

          setDraftTime({
            startAt: defaultStart.add(deltaStart, 'days'),
            bonusEndAt: defaultBonus?.add(deltaStart, 'days'),
            endAt: defaultEnd?.add(deltaStart, 'days'),
          });
        }}
        selected={Boolean(timeBar)}
      />

      <TimePopup
        anchorsOn={timeBar ?? undefined}
        assignedIn={timeline}
        assignedTo={item}
        default={timeline.default}
        for={draftTime}
        gamified={props.gamified}
        newTime
        onClose={(): void => setTimeBar(undefined)}
      />
    </>
  );
};

export default AssignableTimeline;
