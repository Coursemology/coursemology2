import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import { useParams } from 'react-router-dom';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import {
  fetchPersonalTimes,
  fetchUsers,
  loadUser,
  recomputePersonalTimes,
} from '../../operations';
import {
  getAllPersonalTimesEntities,
  getAllUserMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
  getUserEntity,
} from '../../selectors';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import SelectCourseUser from '../../components/misc/SelectCourseUser';
import PersonalTimesTable from '../../components/tables/PersonalTimesTable';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.manage.header',
    defaultMessage: 'Manage Users',
  },
  recomputeSuccess: {
    id: 'course.users.manage.personalTimes.recompute.success',
    defaultMessage: 'Successfully recomputed personal times for {name}',
  },
  fetchPersonalTimesFailure: {
    id: 'course.users.manage.personalTimes.fetch.failue',
    defaultMessage: 'Failed to fetch personal times',
  },
  courseUserHeader: {
    id: 'course.users.manage.personalTimes.header',
    defaultMessage: 'Course User',
  },
  algorithm: {
    id: 'course.users.manage.personalTimes.algorithm',
    defaultMessage: 'Algorithm: {algorithm}',
  },
  recomputeLabel: {
    id: 'course.users.manage.personalTimes.recompute',
    defaultMessage: 'Recompute all times',
  },
  learningRate: {
    id: 'course.users.manage.personalTimes.learningRate.rate',
    defaultMessage: 'Learning rate: {rate}',
  },
  limits: {
    id: 'course.users.manage.personalTimes.learningRate.limits',
    defaultMessage: 'Learning rate effective limits: [{min}, {max}]',
  },
});

const PersonalTimesShow: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const { userId } = useParams();
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  const currentUser = useSelector((state: AppState) =>
    getUserEntity(state, +userId!),
  );
  const personalTimes = useSelector((state: AppState) =>
    getAllPersonalTimesEntities(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchUsers(false));
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(true);
    // we fetch personal times first -- we need learning rate records before loading user
    dispatch(fetchPersonalTimes(+userId!))
      .then(() =>
        dispatch(loadUser(+userId!)).finally(() => {
          setIsLoading(false);
        }),
      )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchPersonalTimesFailure)),
      );
  }, [userId]);

  const handleRecompute = (): void => {
    setIsRecomputing(true);
    dispatch(recomputePersonalTimes(+userId!))
      .then(() =>
        toast.success(
          intl.formatMessage(translations.recomputeSuccess, {
            name: currentUser!.name,
          }),
        ),
      )
      .finally(() =>
        setTimeout(() => {
          setIsRecomputing(false);
        }, 300),
      );
  };

  const renderBody = currentUser && (
    <>
      <Paper
        elevation={3}
        sx={{ padding: '12px 24px 24px 24px', margin: '12px 0px' }}
      >
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ marginBottom: '24px' }}>
            {intl.formatMessage(translations.courseUserHeader)}
          </Typography>
          <SelectCourseUser users={users} initialUser={currentUser} />
          <Grid container flexDirection="row" alignItems="center">
            <Typography variant="body2">
              {intl.formatMessage(translations.algorithm, {
                algorithm: currentUser.timelineAlgorithm,
              })}
            </Typography>
            &nbsp;&mdash;
            <LoadingButton loading={isRecomputing} onClick={handleRecompute}>
              {intl.formatMessage(translations.recomputeLabel)}
            </LoadingButton>
          </Grid>
          {currentUser.learningRate && (
            <>
              <Typography variant="body2">
                {intl.formatMessage(translations.learningRate, {
                  rate: currentUser.learningRate,
                })}
              </Typography>
              <Typography variant="body2">
                {intl.formatMessage(translations.limits, {
                  min: currentUser.learningRateEffectiveMin,
                  max: currentUser.learningRateEffectiveMax,
                })}
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
      <PersonalTimesTable personalTimes={personalTimes} />
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.manageUsersHeader)} />
      <UserManagementTabs permissions={permissions} sharedData={sharedData} />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(PersonalTimesShow);
