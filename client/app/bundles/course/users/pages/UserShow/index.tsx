import { FC, useEffect, useState } from 'react';
import { injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import { getUserEntity } from '../../selectors';
import { loadUser } from '../../operations';
import UserProfileCard from '../../components/UserProfileCard';
import UserProfileAchievements from '../../components/UserProfileAchievements';
import UserProfileSkills from '../../components/UserProfileSkills';

interface Props {
  intl?: any;
}

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

  const styles = {
    userShowPage: {
      '& > * + *': { marginTop: '24px !important' },
    },
  };

  return (
    <Box sx={styles.userShowPage}>
      <UserProfileCard
        name={user.name}
        imageUrl={user.imageUrl}
        email={user.email}
        role={user.role}
        manageEmailSubscriptionUrl={user.manageEmailSubscriptionUrl}
        experiencePointsRecordsUrl={user.experiencePointsRecordsUrl}
        level={user.level}
        exp={user.exp}
        achievementCount={user.achievementCount}
      />
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
