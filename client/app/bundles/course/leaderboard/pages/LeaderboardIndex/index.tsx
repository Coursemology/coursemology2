import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoFixHigh, EmojiEvents, Group, Person } from '@mui/icons-material';
import { Grid, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import palette from 'theme/palette';
import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import LeaderboardTable from '../../components/tables/LeaderboardTable';
import fetchLeaderboard from '../../operations';
import {
  getGroupLeaderboardAchievements,
  getGroupLeaderboardPoints,
  getLeaderboardAchievements,
  getLeaderboardPoints,
  getLeaderboardSettings,
} from '../../selectors';
import { LeaderboardTableType } from '../../types';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchLeaderboardFailure: {
    id: 'course.leaderboards.index.fetch.failure',
    defaultMessage: 'Failed to retrieve Leaderboard.',
  },
  leaderboard: {
    id: 'course.leaderboards.index.leaderboard',
    defaultMessage: 'Leaderboard',
  },
  groupLeaderboard: {
    id: 'course.leaderboards.index.groupLeaderboard',
    defaultMessage: 'Group Leaderboard',
  },
  experience: {
    id: 'course.leaderboards.index.experience',
    defaultMessage: 'By Experience Points',
  },
  achievement: {
    id: 'course.leaderboards.index.achievement',
    defaultMessage: 'By Achievements',
  },
});

const LeaderboardIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const tabView = useMediaQuery(theme.breakpoints.down('lg'));
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState('leaderboard-tab');
  const [innerTabValue, setInnerTabValue] = useState('points-tab');
  const settings = useSelector((state: AppState) =>
    getLeaderboardSettings(state),
  );
  const leaderboardPoints = useSelector((state: AppState) =>
    getLeaderboardPoints(state),
  );
  const leaderboardAchievements = useSelector((state: AppState) =>
    getLeaderboardAchievements(state),
  );
  const groupLeaderboardPoints = useSelector((state: AppState) =>
    getGroupLeaderboardPoints(state),
  );
  const groupLeaderboardAchievements = useSelector((state: AppState) =>
    getGroupLeaderboardAchievements(state),
  );

  useEffect(() => {
    dispatch(fetchLeaderboard())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchLeaderboardFailure)),
      );
  }, [dispatch]);

  const isAchievementHidden = leaderboardAchievements.length === 0;
  const isGroupHidden = groupLeaderboardPoints.length === 0;

  return (
    <>
      <PageHeader
        title={
          settings.groupleaderboardTitle
            ? settings.groupleaderboardTitle
            : intl.formatMessage(translations.leaderboard)
        }
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {!isGroupHidden && (
            <Tabs
              onChange={(_, value): void => {
                setTabValue(value);
              }}
              style={{
                backgroundColor: palette.background.default,
              }}
              sx={{ marginBottom: 2 }}
              TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
              value={tabValue}
              variant="fullWidth"
            >
              <Tab
                icon={<Person />}
                id="leaderboard-tab"
                label={
                  settings.leaderboardTitle ?? (
                    <FormattedMessage {...translations.leaderboard} />
                  )
                }
                style={{ color: palette.submissionIcon.person }}
                value="leaderboard-tab"
              />
              <Tab
                icon={<Group />}
                id="group-leaderboard-tab"
                label={
                  settings.groupleaderboardTitle ?? (
                    <FormattedMessage {...translations.groupLeaderboard} />
                  )
                }
                style={{ color: palette.submissionIcon.person }}
                value="group-leaderboard-tab"
              />
            </Tabs>
          )}
          {tabView && (
            <Tabs
              onChange={(_, value): void => {
                setInnerTabValue(value);
              }}
              style={{
                backgroundColor: palette.background.default,
              }}
              sx={{ marginBottom: 2 }}
              TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
              value={innerTabValue}
              variant="fullWidth"
            >
              <Tab
                icon={<AutoFixHigh />}
                id="points-tab"
                label={
                  settings.leaderboardTitle ?? (
                    <FormattedMessage {...translations.experience} />
                  )
                }
                style={{ color: palette.submissionIcon.person }}
                value="points-tab"
              />
              <Tab
                icon={<EmojiEvents />}
                id="achievement-tab"
                label={
                  settings.groupleaderboardTitle ?? (
                    <FormattedMessage {...translations.achievement} />
                  )
                }
                style={{ color: palette.submissionIcon.person }}
                value="achievement-tab"
              />
            </Tabs>
          )}
          <Grid
            columnSpacing={2}
            container={true}
            direction="row"
            display={tabValue === 'leaderboard-tab' ? 'flex' : 'none'}
            rowSpacing={2}
          >
            {(!tabView || innerTabValue === 'points-tab') && (
              <Grid id="leaderboard-level" item={true} xs={true}>
                <LeaderboardTable
                  data={leaderboardPoints}
                  id={LeaderboardTableType.LeaderboardPoints}
                />
              </Grid>
            )}
            {!isAchievementHidden &&
              (!tabView || innerTabValue === 'achievement-tab') && (
                <Grid id="leaderboard-achievement" item={true} xs={true}>
                  <LeaderboardTable
                    data={leaderboardAchievements}
                    id={LeaderboardTableType.LeaderboardAchievement}
                  />
                </Grid>
              )}
          </Grid>
          <Grid
            columnSpacing={2}
            container={true}
            direction="row"
            display={tabValue !== 'leaderboard-tab' ? 'flex' : 'none'}
            rowSpacing={2}
          >
            {(!tabView || innerTabValue === 'points-tab') && (
              <Grid id="group-leaderboard-level" item={true} xs={true}>
                <LeaderboardTable
                  data={groupLeaderboardPoints}
                  id={LeaderboardTableType.GroupLeaderboardPoints}
                />
              </Grid>
            )}
            {!isAchievementHidden &&
              (!tabView || innerTabValue === 'achievement-tab') && (
                <Grid id="group-leaderboard-achievement" item={true} xs={true}>
                  <LeaderboardTable
                    data={groupLeaderboardAchievements}
                    id={LeaderboardTableType.GroupLeaderboardAchievement}
                  />
                </Grid>
              )}
          </Grid>
        </>
      )}
    </>
  );
};

export default injectIntl(LeaderboardIndex);
