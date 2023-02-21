import { memo } from 'react';
import { toast } from 'react-toastify';
import { MenuItem, TextField } from '@mui/material';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';
import { TimelineAlgorithm } from 'types/course/personalTimes';

import { updateUser } from 'bundles/course/users/operations';
import { TIMELINE_ALGORITHMS } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface AlgorithmMenuProps {
  for: CourseUserMiniEntity;
}

const algorithms = TIMELINE_ALGORITHMS.map((option) => (
  <MenuItem key={option.value} id={option.value} value={option.value}>
    {option.label}
  </MenuItem>
));

const AlgorithmMenu = (props: AlgorithmMenuProps): JSX.Element => {
  const { for: user } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handleAlgorithmUpdate = (
    timelineAlgorithm: TimelineAlgorithm,
  ): void => {
    dispatch(updateUser(user.id, { timelineAlgorithm }))
      .then(() => {
        toast.success(
          t(translations.changeAlgorithmSuccess, {
            name: user.name,
            timeline:
              TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === timelineAlgorithm,
              )?.label ?? 'Unknown',
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.changeAlgorithmFailure, {
            name: user.name,
            timeline:
              TIMELINE_ALGORITHMS.find(
                (timeline) => timeline.value === timelineAlgorithm,
              )?.label ?? 'Unknown',
            error: error.response.data.errors,
          }),
        );
      });
  };

  return (
    <TextField
      key={user.id}
      InputProps={{ disableUnderline: true }}
      onChange={(e): void =>
        handleAlgorithmUpdate(e.target.value as TimelineAlgorithm)
      }
      select
      value={user.timelineAlgorithm}
      variant="standard"
    >
      {algorithms}
    </TextField>
  );
};

export default memo(AlgorithmMenu, (prevProps, nextProps) =>
  equal(prevProps.for.timelineAlgorithm, nextProps.for.timelineAlgorithm),
);
