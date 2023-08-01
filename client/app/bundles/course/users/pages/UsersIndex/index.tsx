import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Avatar, Grid, Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

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
    id: 'course.users.UsersIndex.studentsHeader',
    defaultMessage: 'Students',
  },
  noStudents: {
    id: 'course.users.UsersIndex.noStudents',
    defaultMessage: 'No students in course... yet!',
  },
  fetchUsersFailure: {
    id: 'course.users.UsersIndex.fetchUsersFailure',
    defaultMessage: 'Failed to retrieve course users.',
  },
});

const UsersIndex: FC<Props> = (props) => {
  const { intl } = props;
  const courseId = getCourseId();
  const [isLoading, setIsLoading] = useState(true);
  const users = useAppSelector(getAllStudentMiniEntities);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUsers())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [dispatch]);

  const renderEmptyState = (): JSX.Element => {
    return (
      <Typography>{intl.formatMessage(translations.noStudents)}</Typography>
    );
  };

  return (
    <Page title={intl.formatMessage(translations.studentsHeader)}>
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
                        <Typography>{courseUser.name}</Typography>
                      </Grid>
                    </Grid>
                  </Link>
                </Grid>
              ))
            : renderEmptyState()}
        </Grid>
      )}
    </Page>
  );
};

const handle = translations.studentsHeader;

export default Object.assign(injectIntl(UsersIndex), { handle });
