import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, Typography } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';

import SummaryCard from 'lib/components/core/layouts/SummaryCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';

import UsersButtons from '../../components/buttons/UsersButtons';
import InstanceUsersTabs from '../../components/navigation/InstanceUsersTabs';
import UsersTable from '../../components/tables/UsersTable';
import { indexUsers } from '../../operations';
import { getAdminCounts, getAllUserMiniEntities } from '../../selectors';

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
      'Total Users: {allCount}({adminCount} Administrators' +
      ', {instructorCount} Instructors, {normalCount} Normal)',
  },
  activeUsers: {
    id: 'system.admin.users.activeUsers',
    defaultMessage:
      'Active Users: {allCount} ({adminCount} Administrators' +
      ', {instructorCount} Instructors, {normalCount} Normal){br}' +
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
  const users = useSelector((state: AppState) => getAllUserMiniEntities(state));
  const userCounts = useSelector((state: AppState) => getAdminCounts(state));
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

  const totalInstructor = useMemo(
    () =>
      countWithLink(
        totalCounts.instructorCount ?? 0,
        !filter.active && filter.role === 'instructor',
        (): void => setFilter({ active: false, role: 'instructor' }),
      ),
    [totalCounts.allCount, filter.active, filter.role],
  );

  const totalActiveInstructor = useMemo(
    () =>
      countWithLink(
        activeCounts.instructorCount ?? 0,
        filter.active && filter.role === 'instructor',
        (): void => setFilter({ active: true, role: 'instructor' }),
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
          instructorCount: totalInstructor,
          normalCount: totalNormal,
        })}
      </Typography>
      <Typography variant="body2">
        {intl.formatMessage(translations.totalUsers, {
          allCount: totalActiveUser,
          adminCount: totalActiveAdmin,
          instructorCount: totalActiveInstructor,
          normalCount: totalActiveNormal,
          br: <br />,
        })}
      </Typography>
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      <InstanceUsersTabs currentTab="instance-users-tab" />
      <SummaryCard renderContent={renderSummaryContent} />

      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <UsersTable
          filter={filter}
          renderRowActionComponent={(user): JSX.Element => (
            <UsersButtons user={user} />
          )}
          title={intl.formatMessage(translations.title)}
          userCounts={userCounts}
          users={users}
        />
      )}
    </>
  );
};

export default injectIntl(UsersIndex);
