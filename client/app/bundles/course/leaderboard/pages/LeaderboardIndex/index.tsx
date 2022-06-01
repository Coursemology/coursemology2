import { FC, ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { defineMessages, injectIntl } from 'react-intl';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchLeaderboard } from '../../operations';
import { Grid } from '@mui/material';
import LeaderboardPointsTable from '../../LeaderboardPointsTable';
import LeaderboardAchievementsTable from '../../LeaderboardAchievementsTable';
import { getLeaderboardAchievements, getLeaderboardPoints } from '../../selectors';

interface Props {
  intl?: any;
}

const translations = defineMessages({
  fetchLeaderboardFailure: {
    id: 'course.leaderboards.index.fetch.failure',
    defaultMessage: 'Failed to retrieve Leaderboard.',
  },

});

const LeaderboardIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const leaderboardPoints = useSelector((state: AppState) =>
    getLeaderboardPoints(state),
  );
  const leaderboardAchievements = useSelector((state: AppState) =>
  getLeaderboardAchievements(state),
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

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

  return (
    <>
      <PageHeader
        title={intl.formatMessage({
          id: 'course.leaderboards.index.header',
          defaultMessage: 'Leaderboard',
        })}
        toolbars={headerToolbars}
      />
      <Grid container>
        <Grid item xs={6}>
          <LeaderboardPointsTable data={leaderboardPoints}/>
        </Grid>
        <Grid item xs={6}>
          <LeaderboardAchievementsTable data={leaderboardAchievements}/>
        </Grid>
      </Grid>
    </>
  );

}

export default injectIntl(LeaderboardIndex);