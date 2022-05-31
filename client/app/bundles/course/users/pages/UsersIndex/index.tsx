import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, Grid } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import { getAllUserMiniEntities } from '../../selectors';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchUsers } from '../../operations';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props {
  intl?: any;
}

const styles = {
  courseUserImage: {
    height: 75,
    width: 75,
    marginTop: '1em',
  },
  courseUserName: {
    paddingTop: '2em',
  },
  courseUserMiniEntity: {
    textDecoration: 'none',
  },
};

const translations = defineMessages({
  fetchUsersFailure: {
    id: 'course.users.index.fetch.failure',
    defaultMessage: 'Failed to retrieve course users.',
  },
});

const UsersIndex: FC<Props> = (props) => {
  const { intl } = props;
  const courseId = getCourseId();
  const [isLoading, setIsLoading] = useState(true);
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  const smallUsers = users.concat(users).concat(users).concat(users);
  const largeUsers = smallUsers.concat(smallUsers).concat(smallUsers);
  //   const achievementPermissions = useSelector((state: AppState) =>
  //     getAchievementPermissions(state),
  //   );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

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
          defaultMessage: 'Students',
        })}
        toolbars={headerToolbars}
      />
      <Grid container>
        {largeUsers.map((courseUser) => (
          <Grid
            item
            id={`course_user_${courseUser.id}`}
            key={courseUser.id}
            xs={12}
            md={6}
            lg={4}
          >
            <a
              href={getCourseUserURL(courseId, courseUser.id)}
              style={styles.courseUserMiniEntity}
            >
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid container item xs={3} justifyContent="center">
                  <Avatar
                    src={courseUser.imageUrl}
                    alt={courseUser.name}
                    sx={styles.courseUserImage}
                  />
                </Grid>
                <Grid item xs style={styles.courseUserName}>
                  <h4> {courseUser.name} </h4>
                </Grid>
              </Grid>
            </a>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default injectIntl(UsersIndex);
