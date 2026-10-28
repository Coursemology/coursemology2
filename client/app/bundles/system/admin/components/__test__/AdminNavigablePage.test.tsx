import { Outlet, Route, Routes } from 'react-router-dom';
import { render } from 'test-utils';
import { HomeLayoutData } from 'types/home';

import AdminNavigablePage from '../AdminNavigablePage';

// Route crumbs need a data router (useMatches), and test-utils renders a plain one, so the panel's crumb (from the
// navigator's handle) is given here.
jest.mock('lib/hooks/router/dynamicNest', () => ({
  ...jest.requireActual('lib/hooks/router/dynamicNest'),
  useDynamicNest: (): object => ({
    crumbs: [
      {
        id: 'admin',
        pathname: '/admin',
        content: { url: '/admin', title: 'System Admin Panel' },
      },
    ],
    loading: false,
  }),
}));

// The footer reads FIRST_BUILD_YEAR, which only webpack defines.
jest.mock('lib/components/core/layouts/Footer', () => (): null => null);

// jsdom does not implement scrollIntoView, which the active sidebar item calls, nor scrollTo, which the layout calls
// on navigation. They are assigned rather than spied on, because jest.spyOn needs the method to exist already.
const scrollIntoView = jest.fn();
const scrollTo = jest.fn();

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView;
  Element.prototype.scrollTo = scrollTo;
});

// AppContainer passes the home data to its routes' outlet, which the courseless header reads.
const homeData: HomeLayoutData = { locale: 'en', timeZone: null };

it('marks the parent page active for a nested admin route', async () => {
  const page = render(
    <Routes>
      <Route element={<Outlet context={homeData} />}>
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
      </Route>
    </Routes>,
    { at: ['/admin/marketplace_listings/1'] },
  );

  expect(await page.findByText('Listing detail')).toBeInTheDocument();
  expect(
    page.getByRole('link', { name: 'Marketplace Listings' }),
  ).toHaveAttribute('aria-current', 'page');
  expect(page.getByRole('link', { name: 'Get Help' })).not.toHaveAttribute(
    'aria-current',
  );
  // Once in the sidebar, once as the last breadcrumb.
  expect(page.getAllByText('Marketplace Listings')).toHaveLength(2);
  // The panel's crumb would only redirect to its first page, so it is not a link.
  expect(page.getByText('System Admin Panel')).toBeInTheDocument();
  expect(
    page.queryByRole('link', { name: 'System Admin Panel' }),
  ).not.toBeInTheDocument();
});
