import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import { getUserEntity } from '../../selectors';
import PageHeader from 'lib/components/pages/PageHeader';
import { loadUser } from '../../operations';

interface Props {
  intl?: any;
}

// const styles = {
//   courseUserImage: {
//     height: 75,
//     width: 75,
//     marginTop: '1em',
//   },
//   courseUserName: {
//     paddingTop: '2em',
//   },
//   courseUserMiniEntity: {
//     textDecoration: 'none',
//   },
// };

const translations = defineMessages({
  fetchUserFailure: {
    id: 'course.users.index.fetch.failure',
    defaultMessage: 'Failed to retrieve course user.',
  },
});

const UserShow: FC<Props> = (props) => {
  const { intl } = props;
  //   const courseId = getCourseId();
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state: AppState) => getUserEntity(state));
  //   const achievementPermissions = useSelector((state: AppState) =>
  //     getAchievementPermissions(state),
  //   );
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams();

  useEffect(() => {
    if (userId) {
      dispatch(loadUser(+userId)).finally(() => setIsLoading(false));
    }
  }, [dispatch, userId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return toast.error(intl.formatMessage(translations.fetchUserFailure));
  }

  const headerToolbars: ReactElement[] = [];

  //   if (achievementPermissions?.canReorder) {
  //     headerToolbars.push(
  //       <AchievementReordering key="achievementReorderingButton" />,
  //     );
  //   }

  //   if (achievementPermissions?.canCreate) {
  //     headerToolbars.push(
  //       <Button
  //         className="new-achievement-button"
  //         key="new-achievement-button"
  //         variant="outlined"
  //         color="primary"
  //         onClick={(): void => setIsOpen(true)}
  //         style={styles.newButton}
  //       >
  //         {intl.formatMessage(translations.newAchievement)}
  //       </Button>,
  //     );
  //   }

  return (
    <>
      <PageHeader
        title={intl.formatMessage({
          id: 'course.users.header',
          defaultMessage: 'Profile',
        })}
        toolbars={headerToolbars}
      />
      <Grid container>
        <span> id: {user.id} </span>
        <span> email: {user.email} </span>
        <span> name: {user.name} </span>
        <span> role: {user.role} </span>
        <img src={user.imageUrl} />
        <a href={user.manageEmailSubscriptionUrl}>
          {' '}
          Manage email subscriptions{' '}
        </a>
        <a href={user.experiencePointsRecordsUrl}> Exp records </a>
        <span> achivements: {user.achievementCount} </span>
      </Grid>
    </>
  );
};

export default injectIntl(UserShow);
