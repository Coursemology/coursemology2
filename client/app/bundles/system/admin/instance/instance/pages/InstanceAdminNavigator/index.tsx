import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Page from 'lib/components/core/layouts/Page';

import InstanceAdminTabs from '../../components/navigation/InstanceAdminTabs';
import { fetchInstance } from '../../operations';

const InstanceAdminNavigator = (): JSX.Element => {
  const [instanceName, setInstanceName] = useState('Default');

  useEffect(() => {
    fetchInstance().then((response) => setInstanceName(response.name));
  }, []);

  return (
    <Page title={instanceName} unpadded>
      <InstanceAdminTabs />

      <div className="relative">
        <Outlet />
      </div>
    </Page>
  );
};

export default InstanceAdminNavigator;
