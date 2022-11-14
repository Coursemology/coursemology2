import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Avatar, Grid, Typography } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import CoursesTable from '../../components/tables/CoursesTable';
import InstancesTable from '../../components/tables/InstancesTable';
import { fetchUser } from '../../operations';
import {
  getAllCompletedCourseMiniEntities,
  getAllCurrentCourseMiniEntities,
  getAllInstanceMiniEntities,
  getUserEntity,
} from '../../selectors';

interface Props extends WrappedComponentProps {}

const translations = defineMessages({
  currentCourses: {
    id: 'system.user.show.currentCourses',
    defaultMessage: 'Current Courses',
  },
  completedCourses: {
    id: 'system.user.show.completedCourses',
    defaultMessage: 'Completed Courses',
  },
  otherInstances: {
    id: 'system.user.show.otherInstances',
    defaultMessage: 'Other Instances',
  },
});

const styles = {
  image: {
    height: '140px',
    width: '140px',
  },
};

const UserShow: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);

  const { userId } = useParams();
  const user = useSelector((state: AppState) => getUserEntity(state));
  const currentCourses = useSelector((state: AppState) =>
    getAllCurrentCourseMiniEntities(state),
  );
  const completedCourses = useSelector((state: AppState) =>
    getAllCompletedCourseMiniEntities(state),
  );
  const instances = useSelector((state: AppState) =>
    getAllInstanceMiniEntities(state),
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(+userId)).finally(() => setIsLoading(false));
    }
  }, [dispatch, userId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <Grid
        className="global-user-profile"
        container
        direction="row"
        flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
        spacing={{ xs: 1, sm: 4 }}
        style={{ marginBottom: '8px' }}
      >
        <Grid
          alignItems="center"
          container
          direction="column"
          item
          sm="auto"
          xs={12}
        >
          <Avatar src={user.imageUrl} style={styles.image} />
        </Grid>
        <Grid
          alignItems="center"
          container
          direction="row"
          item
          justifyContent={{ xs: 'center', sm: 'start' }}
        >
          <Typography variant="h4">{user.name}</Typography>
        </Grid>
      </Grid>
      {currentCourses.length > 0 && (
        <CoursesTable
          key="current-courses"
          courses={currentCourses}
          title={intl.formatMessage(translations.currentCourses)}
        />
      )}
      {completedCourses.length > 0 && (
        <CoursesTable
          key="completed-courses"
          courses={completedCourses}
          title={intl.formatMessage(translations.completedCourses)}
        />
      )}
      {instances.length > 0 && (
        <InstancesTable
          instances={instances}
          title={intl.formatMessage(translations.otherInstances)}
        />
      )}
    </>
  );
};

export default injectIntl(UserShow);
