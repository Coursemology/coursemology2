import { FC, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { defineMessages, injectIntl } from 'react-intl';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { fetchLeaderboard } from '../../operations';

interface Props {
  intl?: any;
}

const translations = defineMessages({
  fetchAchievementsFailure: {
    id: 'course.achievement.index.fetch.failure',
    defaultMessage: 'Failed to retrieve Leaderboard.',
  },
});

const LeaderboardIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    dispatch(fetchLeaderboard())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAchievementsFailure)),
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
          id: 'course.leaderboard.header',
          defaultMessage: 'Leaderboard',
        })}
        toolbars={headerToolbars}
      />
    </>
  );

}

export default injectIntl(LeaderboardIndex);