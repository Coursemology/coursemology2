import AppLayout from 'lib/components/core/layouts/AppLayout';

import SystemAdminSidebar from '../../components/navigation/SystemAdminSidebar';

const AdminNavigator = (): JSX.Element => (
  <AppLayout
    renderSidebar={(isExpanded, handleExpand): JSX.Element => (
      <SystemAdminSidebar handleExpand={handleExpand} isExpanded={isExpanded} />
    )}
  />
);

export default AdminNavigator;
