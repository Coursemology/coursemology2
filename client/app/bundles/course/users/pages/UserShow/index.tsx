import { FC, useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import UserProfileAchievements from '../../components/misc/UserProfileAchievements';
import UserProfileCard from '../../components/misc/UserProfileCard';
import UserProfileSkills from '../../components/misc/UserProfileSkills';
import { loadUser } from '../../operations';
import { getUserEntity } from '../../selectors';
import UserStatistics from '../UserStatistics';

type Props = WrappedComponentProps;

const styles = {
  userShowPage: {
    '& > * + *': { marginTop: '24px !important' },
  },
};

const UserShow: FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { userId } = useParams();
  const user = useAppSelector((state) => getUserEntity(state, +userId!));

  useEffect(() => {
    if (userId) {
      dispatch(loadUser(+userId)).finally(() => setIsLoading(false));
    }
  }, [dispatch, userId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={styles.userShowPage}>
      <UserProfileCard user={user} />
      {user.achievements && (
        <UserProfileAchievements achievements={user.achievements} />
      )}
      {user.canReadStatistics && <UserStatistics userRole={user.role} />}
      {user.skillBranches && (
        <UserProfileSkills skillBranches={user.skillBranches} />
      )}
    </Box>
  );
};

export default injectIntl(UserShow);
