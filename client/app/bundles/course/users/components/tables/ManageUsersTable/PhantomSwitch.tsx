import { memo } from 'react';
import { Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import { updateUser } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface PhantomSwitchProps {
  for: CourseUserMiniEntity;
}

const PhantomSwitch = (props: PhantomSwitchProps): JSX.Element => {
  const { for: user } = props;

  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  const handlePhantomUpdate = (phantom: boolean): void => {
    dispatch(updateUser(user.id, { phantom }))
      .then(() => {
        toast.success(
          t(translations.phantomSuccess, {
            name: user.name,
            isPhantom: phantom,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          t(translations.updateFailure, {
            error: error.response?.data?.errors ?? '',
          }),
        );
      });
  };

  return (
    <Switch
      key={user.id}
      checked={user.phantom}
      className="course_user_phantom"
      id={`phantom-${user.id}`}
      onChange={(e): void => handlePhantomUpdate(e.target.checked)}
    />
  );
};

export default memo(PhantomSwitch, (prevProps, nextProps) =>
  equal(prevProps.for.phantom, nextProps.for.phantom),
);
