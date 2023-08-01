import { useState } from 'react';
import {
  ItemWithTimeData,
  TimeData,
  TimelineData,
} from 'types/course/referenceTimelines';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { useLastSaved, useSetLastSaved } from '../../contexts';
import { updateTime } from '../../operations';
import translations from '../../translations';
import TimeBar from '../TimeBar';
import TimePopup from '../TimePopup';

import Timeline from './Timeline';

interface AssignedTimelineProps {
  for: ItemWithTimeData;
  in: TimelineData;
  visualising: TimeData;
  gamified?: boolean;
}

const AssignedTimeline = (props: AssignedTimelineProps): JSX.Element => {
  const { for: item, in: timeline, visualising: time } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const { status } = useLastSaved();
  const { startLoading, abortLoading, setLastSavedToNow } = useSetLastSaved();

  const [timeBar, setTimeBar] = useState<HTMLElement | null>();

  return (
    <>
      <Timeline default={timeline.default} selected={Boolean(timeBar)}>
        <TimeBar
          bonusEndsAt={time.bonusEndAt}
          disabled={status === 'loading'}
          endsAt={time.endAt}
          onChangeTime={(newTime, rollback): void => {
            startLoading();

            dispatch(
              updateTime(timeline.id, item.id, time.id, {
                startAt: newTime.start.toISOString(),
                bonusEndAt: newTime.bonus?.toISOString(),
                endAt: newTime.end?.toISOString(),
              }),
            )
              .then(setLastSavedToNow)
              .catch((error) => {
                rollback();
                abortLoading();
                toast.error(error ?? t(translations.errorUpdatingTime));
              });
          }}
          onClick={setTimeBar}
          selected={Boolean(timeBar)}
          startsAt={time.startAt}
        />
      </Timeline>

      <TimePopup
        anchorsOn={timeBar ?? undefined}
        assignedIn={timeline}
        assignedTo={item}
        default={timeline.default}
        for={time}
        gamified={props.gamified}
        onClose={(): void => setTimeBar(undefined)}
      />
    </>
  );
};

export default AssignedTimeline;
