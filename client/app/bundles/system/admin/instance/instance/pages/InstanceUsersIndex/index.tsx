import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
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
import { Link, Typography } from '@mui/material';
import SummaryCard from 'lib/components/SummaryCard';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { getAdminCounts, getAllUserMiniEntities } from '../../selectors';
import { indexUsers } from '../../operations';
import UsersButtons from '../../components/buttons/UsersButtons';
import UsersTable from '../../components/tables/UsersTable';
import InstanceUsersTabs from '../../components/navigation/InstanceUsersTabs';

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
      '<strong>Total Users: {allCount}</strong> ({adminCount} Administrators' +
      ', {instructorCount} Instructors, {normalCount} Normal)',
  },
  activeUsers: {
    id: 'system.admin.users.activeUsers',
    defaultMessage:
      '<strong>Active Users: {allCount}</strong> ({adminCount} Administrators' +
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
        <FormattedMessage
          {...translations.totalUsers}
          values={{
            strong: (str: ReactNode[]): JSX.Element => <strong>{str}</strong>,
            allCount: totalUser,
            adminCount: totalAdmin,
            instructorCount: totalInstructor,
            normalCount: totalNormal,
          }}
        />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage
          {...translations.activeUsers}
          values={{
            strong: (str: ReactNode[]): JSX.Element => <strong>{str}</strong>,
            allCount: totalActiveUser,
            adminCount: totalActiveAdmin,
            instructorCount: totalActiveInstructor,
            normalCount: totalActiveNormal,
            br: <br />,
          }}
        />
      </Typography>
    </>
  );

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      <InstanceUsersTabs currentTab="users-tab" />
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
