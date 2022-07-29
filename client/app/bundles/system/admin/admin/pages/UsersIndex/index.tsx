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
import { getUrlParameter } from 'lib/helpers/url-helpers';
import { Link, useLocation } from 'react-router-dom';
import { getAdminCounts } from '../../selectors';
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
  const [isLoading, setIsLoading] = useState(false);
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [tableTitle, setTableTitle] = useState(
    intl.formatMessage(translations.title),
  );

  const { activeUsers: activeCounts, totalUsers: totalCounts } = counts;

  const updateTableTitle = (
    role: string | true,
    active: string | true,
  ): void => {
    if (role === true || active === true) {
      return;
    }
    if (role !== '' || active !== '') {
      const roleString = role.replace(/^\w/, (c) => c.toUpperCase()); // capitalize first letter
      let activeString = '';
      if (active === 'true') {
        activeString = ', Active';
      }
      setTableTitle(
        `${intl.formatMessage(
          translations.title,
        )} — (${roleString}${activeString})`,
      );
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const role = getUrlParameter('role');
    const active = getUrlParameter('active');
    updateTableTitle(role, active);
    dispatch(
      indexUsers({
        'filter[length]': 100,
        role,
        active,
      }),
    )
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch, location]);

  const renderSummaryContent: JSX.Element = (
    <>
      <Typography variant="body2">
        <FormattedMessage
          {...translations.totalUsers}
          values={{
            strong: (str: ReactNode[]): JSX.Element => <strong>{str}</strong>,
            allCount: totalCounts.allCount,
            adminCount: (
              <Link to={{ search: `?role=administrator` }}>
                <strong>{totalCounts.adminCount ?? 0}</strong>
              </Link>
            ),
            normalCount: (
              <Link to={{ search: `?role=normal` }}>
                <strong>{totalCounts.normalCount ?? 0}</strong>
              </Link>
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
              <Link to={{ search: `?active=true&role=administrator` }}>
                <strong>{activeCounts.adminCount ?? 0}</strong>
              </Link>
            ),
            normalCount: (
              <Link to={{ search: `?active=true&role=normal` }}>
                <strong>{activeCounts.normalCount ?? 0}</strong>
              </Link>
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
        title={tableTitle}
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
