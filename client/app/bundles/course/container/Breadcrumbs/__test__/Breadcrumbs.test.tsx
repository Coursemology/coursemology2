import { render } from 'test-utils';

import { CrumbData } from 'lib/hooks/router/dynamicNest';

import Breadcrumbs from '../Breadcrumbs';

const crumbs: CrumbData[] = [
  {
    id: '1',
    pathname: '/courses/1',
    content: { url: '/courses/1', title: 'Course' },
  },
  {
    id: '2',
    pathname: '/courses/1/assessments',
    content: { url: '/courses/1/assessments', title: 'Assessments' },
  },
  {
    id: '3',
    pathname: '/courses/1/assessments/2',
    content: { title: 'Attempt' },
  },
];

describe('Breadcrumbs', () => {
  it('links every crumb except the last one', async () => {
    const page = render(<Breadcrumbs in={crumbs} />);

    expect((await page.findByText('Course')).closest('a')).not.toBeNull();
    expect((await page.findByText('Assessments')).closest('a')).not.toBeNull();
    expect((await page.findByText('Attempt')).closest('a')).toBeNull();
  });

  it('renders every crumb as inert text when disableLinks is set', async () => {
    const page = render(<Breadcrumbs disableLinks in={crumbs} />);

    expect((await page.findByText('Course')).closest('a')).toBeNull();
    expect((await page.findByText('Assessments')).closest('a')).toBeNull();
    expect((await page.findByText('Attempt')).closest('a')).toBeNull();
  });
});
