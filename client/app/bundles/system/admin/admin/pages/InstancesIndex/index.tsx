import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';

import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import InstancesButtons from '../../components/buttons/InstancesButtons';
import InstancesTable from '../../components/tables/InstancesTable';
import { indexInstances } from '../../operations';
import { getAllInstanceMiniEntities, getPermissions } from '../../selectors';
import InstanceNew from '../InstanceNew';

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.InstancesIndex.header',
    defaultMessage: 'Instances',
  },
  title: {
    id: 'system.admin.admin.InstancesIndex.title',
    defaultMessage: 'Instances ({count})',
  },
  fetchInstancesFailure: {
    id: 'system.admin.admin.InstancesIndex.fetchInstancesFailure',
    defaultMessage: 'Failed to get instances',
  },
  newInstance: {
    id: 'system.admin.admin.InstancesIndex.newInstance',
    defaultMessage: 'New Instance',
  },
});

const InstancesIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const dispatch = useAppDispatch();

  const permissions = useAppSelector(getPermissions);
  const instances = useAppSelector(getAllInstanceMiniEntities);

  const headerToolbars: ReactElement[] = [];

  useEffect(() => {
    dispatch(indexInstances())
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
        instances={instances}
        renderRowActionComponent={(instance): JSX.Element => (
          <InstancesButtons instance={instance} />
        )}
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
