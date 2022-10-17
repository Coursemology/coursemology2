import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import AppLayout from 'lib/components/core/layouts/AppLayout';
import AdminIndex from './pages/AdminIndex';
import AnnouncementsIndex from './pages/AnnouncementsIndex';
import CoursesIndex from './pages/CoursesIndex';
import InstancesIndex from './pages/InstancesIndex';
import UsersIndex from './pages/UsersIndex';
import configureStore from './store';
import SystemAdminSidebar from './components/navigation/SystemAdminSidebar';

$(() => {
  const mountNode = document.getElementById('system-admin-component');

  if (mountNode) {
    const store = configureStore();

    const renderSidebar = (isExpanded, handleExpand): JSX.Element => {
      return (
        <SystemAdminSidebar
          isExpanded={isExpanded}
          handleExpand={handleExpand}
        />
      );
    };

    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <AppLayout
            renderSidebar={renderSidebar}
            routes={
              <Routes>
                <Route path="/admin" element={<AdminIndex />} />
                <Route
                  path="/admin/announcements"
                  element={<AnnouncementsIndex />}
                />
                <Route path="/admin/users" element={<UsersIndex />} />
                <Route path="/admin/instances" element={<InstancesIndex />} />
                <Route path="/admin/courses" element={<CoursesIndex />} />
              </Routes>
            }
          />
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
