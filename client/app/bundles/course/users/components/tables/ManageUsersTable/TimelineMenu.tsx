import { memo } from 'react';
import { toast } from 'react-toastify';
import { TextField } from '@mui/material';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import { updateUser } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface TimelineMenuProps {
  for: CourseUserMiniEntity;
  submitting: boolean;
  setSubmitting: (status: boolean) => void;
  timelines: JSX.Element[];
  timelinesMap: Record<number, string>;
}

const TimelineMenu = (props: TimelineMenuProps): JSX.Element => {
  const {
    for: user,
    submitting,
    setSubmitting,
    timelines,
    timelinesMap,
  } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleTimelineUpdate = (
    referenceTimelineId: number,
    timeline: string,
  ): void => {
    setSubmitting(true);

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
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <TextField
      key={user.id}
      disabled={submitting}
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

export default memo(
  TimelineMenu,
  (prevProps, nextProps) =>
    equal(prevProps.for.timelineAlgorithm, nextProps.for.timelineAlgorithm) &&
    prevProps.submitting === nextProps.submitting,
);
