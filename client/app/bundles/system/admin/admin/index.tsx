import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppLayout from 'lib/components/core/layouts/AppLayout';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import SystemAdminSidebar from './components/navigation/SystemAdminSidebar';
import AdminIndex from './pages/AdminIndex';
import AnnouncementsIndex from './pages/AnnouncementsIndex';
import CoursesIndex from './pages/CoursesIndex';
import InstancesIndex from './pages/InstancesIndex';
import UsersIndex from './pages/UsersIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    const renderSidebar = (isExpanded, handleExpand): JSX.Element => {
      return (
        <SystemAdminSidebar
          handleExpand={handleExpand}
          isExpanded={isExpanded}
        />
      );
    };

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <AppLayout
            renderSidebar={renderSidebar}
            routes={
              <Routes>
                <Route element={<AdminIndex />} path="/admin" />
                <Route
                  element={<AnnouncementsIndex />}
                  path="/admin/announcements"
                />
                <Route element={<UsersIndex />} path="/admin/users" />
                <Route element={<InstancesIndex />} path="/admin/instances" />
                <Route element={<CoursesIndex />} path="/admin/courses" />
              </Routes>
            }
          />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
