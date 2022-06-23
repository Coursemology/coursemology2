import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import { Grid } from '@mui/material';
import Breadcrumbs from 'lib/components/navigation/Breadcrumbs';
import AdminIndex from './pages/AdminIndex';
import AnnouncementsIndex from './pages/AnnouncementsIndex';
import CoursesIndex from './pages/CoursesIndex';
import InstancesIndex from './pages/InstancesIndex';
import UsersIndex from './pages/UsersIndex';
import configureStore from './store';
import Sidebar from './components/navigation/Sidebar';

$(() => {
  const mountNode = document.getElementById('system-admin-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <div>
            <Breadcrumbs />
            <Grid container>
              <Grid item className="sidebar" sm={4} md={3} lg={2}>
                <Sidebar />
              </Grid>
              <Grid item className="content" sm={8} md={9} lg={10}>
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
              </Grid>
            </Grid>
          </div>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
