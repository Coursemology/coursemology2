import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  WrappedComponentProps,
} from 'react-intl';
import { Group, Person, AutoFixHigh, EmojiEvents } from '@mui/icons-material';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { Grid, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import palette from 'theme/palette';
import fetchLeaderboard from '../../operations';
import LeaderboardTable from '../../components/tables/LeaderboardTable';
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
              TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
              value={tabValue}
              variant="fullWidth"
              sx={{ marginBottom: 2 }}
            >
              <Tab
                id="leaderboard-tab"
                style={{ color: palette.submissionIcon.person }}
                icon={<Person />}
                label={
                  settings.leaderboardTitle ?? (
                    <FormattedMessage {...translations.leaderboard} />
                  )
                }
                value="leaderboard-tab"
              />
              <Tab
                id="group-leaderboard-tab"
                style={{ color: palette.submissionIcon.person }}
                icon={<Group />}
                label={
                  settings.groupleaderboardTitle ?? (
                    <FormattedMessage {...translations.groupLeaderboard} />
                  )
                }
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
              TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
              value={innerTabValue}
              variant="fullWidth"
              sx={{ marginBottom: 2 }}
            >
              <Tab
                id="points-tab"
                style={{ color: palette.submissionIcon.person }}
                icon={<AutoFixHigh />}
                label={
                  settings.leaderboardTitle ?? (
                    <FormattedMessage {...translations.experience} />
                  )
                }
                value="points-tab"
              />
              <Tab
                id="achievement-tab"
                style={{ color: palette.submissionIcon.person }}
                icon={<EmojiEvents />}
                label={
                  settings.groupleaderboardTitle ?? (
                    <FormattedMessage {...translations.achievement} />
                  )
                }
                value="achievement-tab"
              />
            </Tabs>
          )}
          <Grid
            container
            direction="row"
            columnSpacing={2}
            rowSpacing={2}
            display={tabValue === 'leaderboard-tab' ? 'flex' : 'none'}
          >
            {(!tabView || innerTabValue === 'points-tab') && (
              <Grid item xs id="leaderboard-level">
                <LeaderboardTable
                  data={leaderboardPoints}
                  id={LeaderboardTableType.LeaderboardPoints}
                />
              </Grid>
            )}
            {!isAchievementHidden &&
              (!tabView || innerTabValue === 'achievement-tab') && (
                <Grid item xs id="leaderboard-achievement">
                  <LeaderboardTable
                    data={leaderboardAchievements}
                    id={LeaderboardTableType.LeaderboardAchievement}
                  />
                </Grid>
              )}
          </Grid>
          <Grid
            container
            direction="row"
            columnSpacing={2}
            rowSpacing={2}
            display={tabValue !== 'leaderboard-tab' ? 'flex' : 'none'}
          >
            {(!tabView || innerTabValue === 'points-tab') && (
              <Grid item xs id="group-leaderboard-level">
                <LeaderboardTable
                  data={groupLeaderboardPoints}
                  id={LeaderboardTableType.GroupLeaderboardPoints}
                />
              </Grid>
            )}
            {!isAchievementHidden &&
              (!tabView || innerTabValue === 'achievement-tab') && (
                <Grid item xs id="group-leaderboard-achievement">
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
