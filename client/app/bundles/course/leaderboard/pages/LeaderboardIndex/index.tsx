import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import Group from '@mui/icons-material/Group';
import Person from '@mui/icons-material/Person';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { Grid, Tab, Tabs } from '@mui/material';
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

interface Props {
  intl?: any;
}

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
});

const LeaderboardIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState('leaderboard-tab');
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

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const isAchievementHidden = leaderboardAchievements.length === 0;
  const isGroupHidden = groupLeaderboardPoints.length === 0;

  return (
    <>
      <PageHeader
        title={
          settings.leaderboardTitle ??
          intl.formatMessage({ ...translations.leaderboard })
        }
      />
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
            id="groupLeaderboard-tab"
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

      {/* {tabValue === 'leaderboard-tab' && ( */}
      <Grid
        container
        direction="row"
        columnSpacing={2}
        rowSpacing={2}
        display={tabValue === 'leaderboard-tab' ? 'flex' : 'none'}
      >
        <Grid item xs id="leaderboard-level">
          <LeaderboardTable
            data={leaderboardPoints}
            id={LeaderboardTableType.LeaderboardPoints}
          />
        </Grid>
        {!isAchievementHidden && (
          <Grid item xs>
            <LeaderboardTable
              data={leaderboardAchievements}
              id={LeaderboardTableType.LeaderboardAchievement}
            />
          </Grid>
        )}
      </Grid>
      {/* )} */}

      {/* {tabValue === 'group-leaderboard-tab' && ( */}
      <Grid
        container
        direction="row"
        columnSpacing={2}
        rowSpacing={2}
        display={tabValue !== 'leaderboard-tab' ? 'flex' : 'none'}
      >
        <Grid item xs>
          <LeaderboardTable
            data={groupLeaderboardPoints}
            id={LeaderboardTableType.GroupLeaderboardPoints}
          />
        </Grid>
        {!isAchievementHidden && (
          <Grid item xs>
            <LeaderboardTable
              data={groupLeaderboardAchievements}
              id={LeaderboardTableType.GroupLeaderboardAchievement}
            />
          </Grid>
        )}
      </Grid>
      {/* )} */}
    </>
  );
};

export default injectIntl(LeaderboardIndex);
