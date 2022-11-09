import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

import InstancesButtons from '../../components/buttons/InstancesButtons';
import InstancesTable from '../../components/tables/InstancesTable';
import { indexInstances } from '../../operations';
import { getAdminCounts, getPermissions } from '../../selectors';
import InstanceNew from '../InstanceNew';

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.header',
    defaultMessage: 'Instances',
  },
  title: {
    id: 'system.admin.instance.title',
    defaultMessage: 'Instances ({count})',
  },
  fetchInstancesFailure: {
    id: 'system.admin.instance.fetchInstances.failure',
    defaultMessage: 'Failed to get instances',
  },
  newInstance: {
    id: 'system.admin.instance.new',
    defaultMessage: 'New Instance',
  },
});

const InstancesIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const permissions = useSelector((state: AppState) => getPermissions(state));
  const dispatch = useDispatch<AppDispatch>();
  const headerToolbars: ReactElement[] = [];

  useEffect(() => {
    dispatch(indexInstances({ 'filter[length]': TABLE_ROWS_PER_PAGE }))
      .catch(() => toast.error(t(translations.fetchInstancesFailure)))
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  if (permissions.canCreateInstances) {
    headerToolbars.push(
      <AddButton
        key="new-instance-button"
        className="text-white"
        id="new-instance-button"
        onClick={(): void => {
          setIsOpen(true);
        }}
        tooltip={t(translations.newInstance)}
      />,
    );
  }

  const renderBody: JSX.Element = (
    <>
      <InstancesTable
        renderRowActionComponent={(instance): JSX.Element => (
          <InstancesButtons instance={instance} />
        )}
        title={t(translations.title, {
          count: counts.instancesCount,
        })}
      />
      {isOpen && (
        <InstanceNew onClose={(): void => setIsOpen(false)} open={isOpen} />
      )}
    </>
  );

  return (
    <>
      <PageHeader title={t(translations.header)} toolbars={headerToolbars} />
      {isLoading ? <LoadingIndicator /> : renderBody}
    </>
  );
};

export default InstancesIndex;
