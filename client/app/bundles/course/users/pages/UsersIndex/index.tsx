import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Avatar, Grid, Typography } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import { fetchUsers } from '../../operations';
import { getAllStudentMiniEntities } from '../../selectors';

type Props = WrappedComponentProps;

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
  const users = useSelector((state: AppState) =>
    getAllStudentMiniEntities(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [dispatch]);

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
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <Grid container>
          {users.length > 0
            ? users.map((courseUser) => (
                <Grid
                  key={courseUser.id}
                  className={`course-user-${courseUser.id}`}
                  item
                  lg={4}
                  md={6}
                  xs={12}
                >
                  <Link
                    style={{ textDecoration: 'none' }}
                    to={getCourseUserURL(courseId, courseUser.id)}
                  >
                    <Grid
                      alignItems="center"
                      container
                      direction="row"
                      spacing={1}
                    >
                      <Grid container item justifyContent="center" xs={3}>
                        <Avatar
                          alt={courseUser.name}
                          src={courseUser.imageUrl}
                          sx={styles.courseUserImage}
                        />
                      </Grid>
                      <Grid item style={styles.courseUserName} xs>
                        <Typography variant="body1">
                          {courseUser.name}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Link>
                </Grid>
              ))
            : renderEmptyState()}
        </Grid>
      )}
    </>
  );
};

export default injectIntl(UsersIndex);
