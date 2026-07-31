import { render } from 'test-utils';
import { CourseLayoutData } from 'types/course/courses';
import { HomeLayoutData } from 'types/home';

import Sidebar from '../Sidebar';

// `Sidebar` mounts `BrandingHead.Mini` and `CourseItem`, both of which read the root payload through
// `useAppContext()` — i.e. `useOutletContext()`, which is null outside a rendered `Outlet`. In the app
// the sidebar always renders inside `CourseContainer`'s outlet; here the payload is supplied directly.
jest.mock('lib/containers/AppContainer', () => ({
  ...jest.requireActual('lib/containers/AppContainer'),
  useAppContext: (): HomeLayoutData => ({
    locale: 'en',
    timeZone: 'Asia/Singapore',
  }),
}));

const data: CourseLayoutData = {
  courseTitle: 'Marketplace Preview',
  courseUrl: '/courses/1',
  courseUserUrl: '/courses/1/users/1',
  userName: 'Previewer',
  userId: 1,
  sidebar: [
    {
      key: 'sidebar_assessments',
      path: '/courses/1/assessments',
      icon: 'assessment',
    },
  ],
};

describe('Sidebar', () => {
  it('links Home to the course', async () => {
    const page = render(<Sidebar from={data} />);

    expect((await page.findByText('Home')).closest('a')).toHaveAttribute(
      'href',
      '/courses/1',
    );
  });

  it('links Home to the learn page when the course home redirects there', async () => {
    const page = render(
      <Sidebar from={{ ...data, homeRedirectsToLearn: true }} />,
    );

    expect((await page.findByText('Home')).closest('a')).toHaveAttribute(
      'href',
      '/courses/1/home',
    );
  });

  it('renders Home as inert text for a restricted previewer', async () => {
    const page = render(
      <Sidebar from={{ ...data, isPreviewRestricted: true }} />,
    );

    expect((await page.findByText('Home')).closest('a')).toBeNull();
  });
});
