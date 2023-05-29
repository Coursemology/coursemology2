import { Outlet } from 'react-router-dom';

import Page from 'lib/components/core/layouts/Page';

import SystemAdminTabs from '../../components/navigation/SystemAdminTabs';

const AdminNavigator = (): JSX.Element => (
  <Page title="System Admin Panel" unpadded>
    <SystemAdminTabs />

    <div className="relative">
      <Outlet />
    </div>
  </Page>
);

export default AdminNavigator;
