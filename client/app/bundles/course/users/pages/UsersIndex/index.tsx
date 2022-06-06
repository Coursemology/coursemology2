import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { fetchUsers } from '../../operations';
import { getAllUserMiniEntities } from '../../selectors';

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
};

const translations = defineMessages({
  studentsHeader: {
    id: 'course.users.header',
    defaultMessage: 'Students',
  },
  noStudents: {
    id: 'course.users.index.noStudents',
    defaultMessage: 'No students in course... yet!',
  },
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

  const renderEmptyState = (): JSX.Element => {
    return (
      <Typography variant="body1">
        {intl.formatMessage(translations.noStudents)}
      </Typography>
    );
  };

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.studentsHeader)} />
      <Grid container>
        {users.length > 0
          ? users.map((courseUser) => (
              <Grid
                item
                className={`course-user-${courseUser.id}`}
                key={courseUser.id}
                xs={12}
                md={6}
                lg={4}
              >
                <Link
                  to={getCourseUserURL(courseId, courseUser.id)}
                  style={{ textDecoration: 'none' }}
                >
                  <Grid
                    container
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Grid container item xs={3} justifyContent="center">
                      <Avatar
                        src={courseUser.imageUrl}
                        alt={courseUser.name}
                        sx={styles.courseUserImage}
                      />
                    </Grid>
                    <Grid item xs style={styles.courseUserName}>
                      <Typography variant="body1">{courseUser.name}</Typography>
                    </Grid>
                  </Grid>
                </Link>
              </Grid>
            ))
          : renderEmptyState()}
      </Grid>
    </>
  );
};

export default injectIntl(UsersIndex);
