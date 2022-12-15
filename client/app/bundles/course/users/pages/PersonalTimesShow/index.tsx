import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import {
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CourseUserEntity } from 'types/course/courseUsers';
import { TimelineAlgorithm } from 'types/course/personalTimes';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { TIMELINE_ALGORITHMS } from 'lib/constants/sharedConstants';

import SelectCourseUser from '../../components/misc/SelectCourseUser';
import UserManagementTabs from '../../components/navigation/UserManagementTabs';
import PersonalTimesTable from '../../components/tables/PersonalTimesTable';
import {
  fetchPersonalTimes,
  fetchUsers,
  loadUser,
  recomputePersonalTimes,
  updateUser,
} from '../../operations';
import {
  getAllPersonalTimesEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
  getUserEntity,
} from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  manageUsersHeader: {
    id: 'course.users.PersonalTimesShow.manageUsersHeader',
    defaultMessage: 'Manage Users',
  },
  recomputeSuccess: {
    id: 'course.users.PersonalTimesShow.recomputeSuccess',
    defaultMessage: 'Successfully recomputed personal times for {name}',
  },
  fetchPersonalTimesFailure: {
    id: 'course.users.PersonalTimesShow.fetchPersonalTimesFailure',
    defaultMessage: 'Failed to fetch personal times',
  },
  courseUserHeader: {
    id: 'course.users.PersonalTimesShow.courseUserHeader',
    defaultMessage: 'Course User',
  },
  algorithm: {
    id: 'course.users.PersonalTimesShow.algorithm',
    defaultMessage: 'Algorithm: {algorithm}',
  },
  recomputeLabel: {
    id: 'course.users.PersonalTimesShow.recomputeLabel',
    defaultMessage: 'Recompute all times',
  },
  updateSuccess: {
    id: 'course.users.PersonalTimesShow.updateSuccess',
    defaultMessage: "Successfully updated {name}/'s timeline to {timeline}",
  },
  updateFailure: {
    id: 'course.users.PersonalTimesShow.updateFailure',
    defaultMessage:
      "Failed to update {name}'s timeline to {timeline} - {error}",
  },
  learningRate: {
    id: 'course.users.PersonalTimesShow.learningRate',
    defaultMessage: 'Learning rate: {rate}',
  },
  limits: {
    id: 'course.users.PersonalTimesShow.limits',
    defaultMessage: 'Learning rate effective limits: [{min}, {max}]',
  },
});

const PersonalTimesShow: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const { userId } = useParams();
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
  const [timeline, setTimeline] = useState('fixed');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchUsers(true));

    // we fetch personal times before user -- we need learning rate records before user
    dispatch(fetchPersonalTimes(+userId!))
      .then(() =>
        dispatch(loadUser(+userId!))
          .then((response) => {
            setTimeline(response.user.timelineAlgorithm!);
          })
          .finally(() => {
            setIsLoading(false);
          }),
      )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchPersonalTimesFailure)),
      );
  }, [dispatch, userId]);

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

  const handleTimelineChange = (event): void => {
    if (currentUser) {
      const newTimeline = event.target.value;
      const data: CourseUserEntity = {
        ...currentUser,
        timelineAlgorithm: newTimeline as TimelineAlgorithm,
      };

      dispatch(updateUser(+userId!, data))
        .then(() => {
          toast.success(
            intl.formatMessage(translations.updateSuccess, {
              name: currentUser.name,
              timeline: newTimeline,
            }),
          );
          setTimeline(newTimeline);
        })
        .catch((error) => {
          toast.error(
            intl.formatMessage(translations.updateFailure, {
              name: currentUser.name,
              timeline: newTimeline,
              error: error.response.data.errors,
            }),
          );
        });
    }
  };

  const renderBody = currentUser && (
    <>
      <Paper
        elevation={3}
        sx={{ padding: '12px 24px 24px 24px', margin: '12px 0px' }}
      >
        <Stack spacing={1}>
          <Typography variant="h6">
            {intl.formatMessage(translations.courseUserHeader)}
          </Typography>
          <Grid alignItems="flex-end" container flexDirection="row">
            <SelectCourseUser initialUser={currentUser} />
            <TextField
              id="change-timeline"
              label="Timeline Algorithm"
              onChange={handleTimelineChange}
              select
              sx={{ minWidth: '300px', marginRight: '12px' }}
              value={timeline}
              variant="standard"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
              {TIMELINE_ALGORITHMS.map((timeline) => (
                <MenuItem
                  key={`change-timeline-${timeline.value}`}
                  value={timeline.value}
                >
                  {timeline.label}
                </MenuItem>
              ))}
            </TextField>
            <LoadingButton
              loading={isRecomputing}
              onClick={handleRecompute}
              variant="contained"
            >
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
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default injectIntl(PersonalTimesShow);
