import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, AppDispatch } from 'types/store';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import { indexInstances } from '../../operations';
import InstancesTable from '../../components/tables/InstancesTable';
import InstancesButtons from '../../components/buttons/InstancesButtons';
import { getAllInstanceMiniEntities, getPermissions } from '../../selectors';
import NewInstanceButton from '../../components/buttons/NewInstanceButton';
import InstanceNew from '../InstanceNew';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instances.header',
    defaultMessage: 'Instances',
  },
  fetchInstancesFailure: {
    id: 'system.admin.admin.fetchInstances.failure',
    defaultMessage: 'Failed to get instances',
  },
});

const InstancesIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const instances = useSelector((state: AppState) =>
    getAllInstanceMiniEntities(state),
  );
  const permissions = useSelector((state: AppState) => getPermissions(state));
  const dispatch = useDispatch<AppDispatch>();
  const headerToolbars: ReactElement[] = [];

  useEffect(() => {
    dispatch(indexInstances())
      .finally(() => setIsLoading(false))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchInstancesFailure)),
      );
  }, [dispatch]);

  if (permissions.canCreate) {
    headerToolbars.push(
      <NewInstanceButton key="new-instance-button" setIsOpen={setIsOpen} />,
    );
  }

  const renderBody: JSX.Element = (
    <>
      <Typography variant="body1">
        Total Instances: <strong>{instances.length}</strong>
      </Typography>
      <InstancesTable
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
