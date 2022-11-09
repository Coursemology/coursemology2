import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, AppDispatch } from 'types/store';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { toast } from 'react-toastify';
import AddButton from 'lib/components/core/buttons/AddButton';
import useTranslation from 'lib/hooks/useTranslation';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { indexInstances } from '../../operations';
import InstancesTable from '../../components/tables/InstancesTable';
import InstancesButtons from '../../components/buttons/InstancesButtons';
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
        className="text-white"
        id="new-instance-button"
        key="new-instance-button"
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
        title={t(translations.title, {
          count: counts.instancesCount,
        })}
        renderRowActionComponent={(instance): JSX.Element => (
          <InstancesButtons instance={instance} />
        )}
      />
      {isOpen && (
        <InstanceNew open={isOpen} onClose={(): void => setIsOpen(false)} />
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
