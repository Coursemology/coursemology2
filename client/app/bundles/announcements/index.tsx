import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import configureStore from './store';
import GlobalAnnouncementIndex from './pages/GlobalAnnouncementIndex';

$(() => {
  const mountNode = document.getElementById('global-announcements-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/announcements"
              element={<GlobalAnnouncementIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
