import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import InstancesButtons from '../components/buttons/InstancesButtons';
import InstancesTable from '../components/tables/InstancesTable';
import { indexInstances } from '../operations';
import { getAllInstanceMiniEntities, getPermissions } from '../selectors';

import InstanceNew from './InstanceNew';
import WidthAdjustedNewButton from 'bundles/common/components/WidthAdjustedNewButton';

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

  useEffect(() => {
    dispatch(indexInstances())
      .catch(() => toast.error(t(translations.fetchInstancesFailure)))
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <InstancesTable
        className="border-none"
        instances={instances}
        newInstanceButton={
          permissions.canCreateInstances && (
            <WidthAdjustedNewButton
              minWidth={720}
              textButtonKey="new-instance-button"
              textButtonClassName="whitespace-nowrap"
              nonTextButtonKey="new-instance-button"
              nonTextButtonClassName="whitespace-nowrap"
              onClick={(): void => setIsOpen(true)}
              text={t(translations.newInstance)}
            />
          )
        }
        renderRowActionComponent={(instance): JSX.Element => (
          <InstancesButtons instance={instance} />
        )}
      />

      {isOpen && (
        <InstanceNew onClose={(): void => setIsOpen(false)} open={isOpen} />
      )}
    </>
  );
};

export default InstancesIndex;
