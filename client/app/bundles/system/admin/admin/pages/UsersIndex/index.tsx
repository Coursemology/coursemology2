import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppState, AppDispatch } from 'types/store';
import { Link, Typography } from '@mui/material';
import SummaryCard from 'lib/components/SummaryCard';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
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
  title: {
    id: 'system.admin.users.title',
    defaultMessage: 'Users',
  },
  fetchUsersFailure: {
    id: 'system.admin.users.fetch.failure',
    defaultMessage: 'Failed to fetch users.',
  },
  totalUsers: {
    id: 'system.admin.users.totalUsers',
    defaultMessage:
      'Total Users: {allCount} ({adminCount} Administrators' +
      ', {normalCount} Normal)',
  },
  activeUsers: {
    id: 'system.admin.users.activeUsers',
    defaultMessage:
      'Active Users: {allCount} ({adminCount} Administrators' +
      ', {normalCount} Normal){br}' +
      '(active in the past 7 days)',
  },
});

const countWithLink = (
  count: number,
  disableLink: boolean,
  linkCallbak: () => void,
): JSX.Element => {
  if (disableLink || count === 0) {
    return <strong>{count}</strong>;
  }
  return (
    <Link component="button" onClick={linkCallbak}>
      <strong>{count}</strong>
    </Link>
  );
};

const UsersIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({ active: false, role: '' });
  const userCounts = useSelector((state: AppState) => getAdminCounts(state));
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  const dispatch = useDispatch<AppDispatch>();
  const { activeUsers: activeCounts, totalUsers: totalCounts } = userCounts;

  const totalUser = useMemo(
    () =>
      countWithLink(
        totalCounts.allCount,
        !filter.active && !filter.role,
        (): void => setFilter({ active: false, role: '' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  const totalActiveUser = useMemo(
    () =>
      countWithLink(
        activeCounts.allCount,
        filter.active && !filter.role,
        (): void => setFilter({ active: true, role: '' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  const totalAdmin = useMemo(
    () =>
      countWithLink(
        totalCounts.adminCount ?? 0,
        !filter.active && filter.role === 'administrator',
        (): void => setFilter({ active: false, role: 'administrator' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  const totalActiveAdmin = useMemo(
    () =>
      countWithLink(
        activeCounts.adminCount ?? 0,
        filter.active && filter.role === 'administrator',
        (): void => setFilter({ active: true, role: 'administrator' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  const totalNormal = useMemo(
    () =>
      countWithLink(
        totalCounts.normalCount ?? 0,
        !filter.active && filter.role === 'normal',
        (): void => setFilter({ active: false, role: 'normal' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  const totalActiveNormal = useMemo(
    () =>
      countWithLink(
        activeCounts.normalCount ?? 0,
        filter.active && filter.role === 'normal',
        (): void => setFilter({ active: true, role: 'normal' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      indexUsers({
        'filter[length]': TABLE_ROWS_PER_PAGE,
        role: filter.role,
        active: filter.active,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch, filter.role, filter.active]);

  const renderSummaryContent: JSX.Element = (
    <>
      <Typography variant="body2">
        {intl.formatMessage(translations.totalUsers, {
          allCount: totalUser,
          adminCount: totalAdmin,
          normalCount: totalNormal,
        })}
      </Typography>
      <Typography variant="body2">
        {intl.formatMessage(translations.activeUsers, {
          allCount: totalActiveUser,
          adminCount: totalActiveAdmin,
          normalCount: totalActiveNormal,
          br: <br />,
        })}
      </Typography>
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      <SummaryCard renderContent={renderSummaryContent} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <UsersTable
          users={users}
          userCounts={userCounts}
          filter={filter}
          title={intl.formatMessage(translations.title)}
          renderRowActionComponent={(user): JSX.Element => (
            <UsersButtons user={user} />
          )}
        />
      )}
    </>
  );
};

export default injectIntl(UsersIndex);
