import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import GlobalAnnouncementsIndex from './pages/GlobalAnnouncementsIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('global-announcements-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/announcements"
              element={<GlobalAnnouncementsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
