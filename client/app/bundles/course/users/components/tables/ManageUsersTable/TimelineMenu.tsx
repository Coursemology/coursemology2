import { memo } from 'react';
import { TextField } from '@mui/material';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import { updateUser } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface TimelineMenuProps {
  for: CourseUserMiniEntity;
  timelines: JSX.Element[];
  timelinesMap: Record<number, string>;
}

const TimelineMenu = (props: TimelineMenuProps): JSX.Element => {
  const { for: user, timelines, timelinesMap } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleTimelineUpdate = (
    referenceTimelineId: number,
    timeline: string,
  ): void => {
    dispatch(updateUser(user.id, { referenceTimelineId }))
      .then(() => {
        toast.success(
          t(translations.changeTimelineSuccess, { name: user.name, timeline }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.changeTimelineFailure, { name: user.name, timeline }),
        );
      });
  };

  return (
    <TextField
      key={user.id}
      InputProps={{ disableUnderline: true }}
      onChange={(e): void => {
        const timelineId = parseInt(e.target.value, 10);

        handleTimelineUpdate(
          timelineId,
          timelinesMap[timelineId] || t(translations.defaultTimeline),
        );
      }}
      select
      value={user.referenceTimelineId}
      variant="standard"
    >
      {timelines}
    </TextField>
  );
};

export default memo(TimelineMenu, (prevProps, nextProps) =>
  equal(prevProps.for.timelineAlgorithm, nextProps.for.timelineAlgorithm),
);
