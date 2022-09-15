import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, AppDispatch } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { toast } from 'react-toastify';
import AddButton from 'lib/components/buttons/AddButton';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { indexInstances } from '../../operations';
import InstancesTable from '../../components/tables/InstancesTable';
import InstancesButtons from '../../components/buttons/InstancesButtons';
import { getAdminCounts, getPermissions } from '../../selectors';
import InstanceNew from '../InstanceNew';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instances.header',
    defaultMessage: 'Instances',
  },
  title: {
    id: 'system.admin.instances.title',
    defaultMessage: 'Instances ({count})',
  },
  fetchInstancesFailure: {
    id: 'system.admin.admin.fetchInstances.failure',
    defaultMessage: 'Failed to get instances',
  },
  newInstance: {
    id: 'system.admin.instance.new',
    defaultMessage: 'New Instance',
  },
});

const InstancesIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const counts = useSelector((state: AppState) => getAdminCounts(state));
  const permissions = useSelector((state: AppState) => getPermissions(state));
  const dispatch = useDispatch<AppDispatch>();
  const headerToolbars: ReactElement[] = [];

  useEffect(() => {
    dispatch(indexInstances({ 'filter[length]': TABLE_ROWS_PER_PAGE }))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchInstancesFailure)),
      )
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
        tooltip={intl.formatMessage(translations.newInstance)}
      />,
    );
  }

  const renderBody: JSX.Element = (
    <>
      <InstancesTable
        title={intl.formatMessage(translations.title, {
          count: counts.instancesCount,
        })}
        renderRowActionComponent={(instance): JSX.Element => (
          <InstancesButtons instance={instance} />
        )}
      />
      <InstanceNew open={isOpen} handleClose={(): void => setIsOpen(false)} />
    </>
  );

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.header)}
        toolbars={headerToolbars}
      />
      {isLoading ? <LoadingIndicator /> : <>{renderBody}</>}
    </>
  );
};

export default injectIntl(InstancesIndex);
