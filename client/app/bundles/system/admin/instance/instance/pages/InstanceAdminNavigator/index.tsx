import AppLayout from 'lib/components/core/layouts/AppLayout';

import InstanceAdminSidebar from '../../components/navigation/InstanceAdminSidebar';

const InstanceAdminNavigator = (): JSX.Element => (
  <AppLayout
    renderSidebar={(isExpanded, handleExpand): JSX.Element => (
      <InstanceAdminSidebar
        handleExpand={handleExpand}
        isExpanded={isExpanded}
      />
    )}
  />
);

export default InstanceAdminNavigator;
