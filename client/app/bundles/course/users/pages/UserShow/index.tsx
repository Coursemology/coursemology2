import { FC, useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import UserProfileAchievements from '../../components/misc/UserProfileAchievements';
import UserProfileCard from '../../components/misc/UserProfileCard';
import UserProfileSkills from '../../components/misc/UserProfileSkills';
import { loadUser } from '../../operations';
import { getUserEntity } from '../../selectors';

type Props = WrappedComponentProps;

const styles = {
  userShowPage: {
    '& > * + *': { marginTop: '24px !important' },
  },
};

const UserShow: FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams();
  const user = useSelector((state: AppState) => getUserEntity(state, +userId!));

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
      {user.skillBranches && (
        <UserProfileSkills skillBranches={user.skillBranches} />
      )}
    </Box>
  );
};

export default injectIntl(UserShow);
