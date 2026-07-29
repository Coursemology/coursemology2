import { Route, Routes } from 'react-router-dom';
import { render } from 'test-utils';

import AdminNavigablePage from '../AdminNavigablePage';

it('selects a parent tab for a nested admin route', async () => {
  const page = render(
    <Routes>
      <Route
        element={
          <AdminNavigablePage
            paths={[
              {
                icon: <span />,
                title: 'Marketplace Listings',
                path: '/admin/marketplace_listings',
              },
              {
                icon: <span />,
                title: 'Get Help',
                path: '/admin/get_help',
              },
            ]}
          />
        }
        path="/admin"
      >
        <Route
          element={<span>Listing detail</span>}
          path="marketplace_listings/:listingId"
        />
      </Route>
    </Routes>,
    { at: ['/admin/marketplace_listings/1'] },
  );

  expect(await page.findByText('Listing detail')).toBeInTheDocument();
  expect(
    page.getByRole('tab', { name: 'Marketplace Listings' }),
  ).toHaveAttribute('aria-selected', 'true');
});
