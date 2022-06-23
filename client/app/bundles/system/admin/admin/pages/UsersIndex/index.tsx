import { FC, ReactNode, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import { Typography } from '@mui/material';
import SummaryCard from 'lib/components/SummaryCard';
import { getAdminCounts, getAllUserMiniEntities } from '../../selectors';
import { indexUsers } from '../../operations';
import UsersButtons from '../../components/buttons/UsersButtons';
import UsersTable from '../../components/tables/UsersTable';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.users.header',
    defaultMessage: 'Users',
  },
  fetchUsersFailure: {
    id: 'system.admin.users.fetch.failure',
    defaultMessage: 'Unable to fetch users',
  },
  totalUsers: {
    id: 'system.admin.users.totalUsers',
    defaultMessage:
      '<strong>Total Users: {allCount}</strong> ({adminCount} Administrators' +
      ', {normalCount} Normal)',
  },
  activeUsers: {
    id: 'system.admin.users.activeUsers',
    defaultMessage:
      '<strong>Active Users: {allCount}</strong> ({adminCount} Administrators' +
      ', {normalCount} Normal){br}' +
      '(active in the past 7 days)',
  },
});

const UsersIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const dispatch = useDispatch<AppDispatch>();

  const { activeUsers: activeCounts, totalUsers: totalCounts } = counts;

  useEffect(() => {
    dispatch(indexUsers())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [dispatch]);

  const renderSummaryContent: JSX.Element = (
    <>
      <Typography variant="body2">
        <FormattedMessage
          {...translations.totalUsers}
          values={{
            strong: (str: ReactNode[]): JSX.Element => <strong>{str}</strong>,
            allCount: totalCounts.allCount,
            adminCount: (
              <a href="?role=administrator">
                <strong>{totalCounts.adminCount ?? 0}</strong>
              </a>
            ),
            normalCount: (
              <a href="?role=normal">
                <strong>{totalCounts.normalCount ?? 0}</strong>
              </a>
            ),
          }}
        />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage
          {...translations.activeUsers}
          values={{
            strong: (str: ReactNode[]): JSX.Element => <strong>{str}</strong>,
            allCount: activeCounts.allCount ?? 0,
            adminCount: (
              <a href="?active=true&role=administrator">
                <strong>{activeCounts.adminCount ?? 0}</strong>
              </a>
            ),
            normalCount: (
              <a href="?active=true&role=normal">
                <strong>{activeCounts.normalCount ?? 0}</strong>
              </a>
            ),
            br: <br />,
          }}
        />
      </Typography>
    </>
  );

  const renderBody: JSX.Element = (
    <>
      <div>
        <SummaryCard renderContent={renderSummaryContent} />
      </div>
      <UsersTable
        users={users}
        renderRowActionComponent={(user): JSX.Element => (
          <UsersButtons user={user} />
        )}
      />
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(UsersIndex);
