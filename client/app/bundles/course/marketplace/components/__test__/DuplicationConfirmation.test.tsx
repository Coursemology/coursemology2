import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import DuplicateConfirmation from '../DuplicateConfirmation';

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

const listings = [{ id: 1, title: 'Recursion Drills' }] as never;
const url = `/courses/${global.courseId}/marketplace/listings/duplicate`;
const course = { title: 'Enrollable Course', url: '/courses/4' };

it('shows the destination course and assessment tree with real names', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCategory={{ id: 5, title: 'Missions' }}
      destinationCourse={course}
      destinationTab={{ id: 42, title: 'Assignments' }}
      destinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  // I18nProvider shows a LoadingIndicator until locale messages async-load;
  // await the first query to render past it, then the rest are synchronous.
  expect(await page.findByText('Enrollable Course')).toBeVisible();
  expect(page.getByText('Missions')).toBeVisible();
  expect(page.getByText('Assignments')).toBeVisible();
  expect(page.getByText('Recursion Drills')).toBeVisible();
  // The old raw-key bug must not recur.
  expect(
    page.queryByText('course.marketplace.duplicateTitle'),
  ).not.toBeInTheDocument();
});

it('falls back to Default placeholders when entered without a tab', async () => {
  const page = render(
    <DuplicateConfirmation
      destinationCategory={null}
      destinationCourse={course}
      destinationTab={null}
      destinationTabId={null}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );

  expect(await page.findByText('Default Category')).toBeVisible();
  expect(page.getByText('Default Tab')).toBeVisible();
});

it('posts a duplication request with the destination tab on confirm', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  const page = render(
    <DuplicateConfirmation
      destinationCategory={{ id: 5, title: 'Missions' }}
      destinationCourse={course}
      destinationTab={{ id: 42, title: 'Assignments' }}
      destinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );
  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));
  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(JSON.parse(mock.history.post[0].data)).toMatchObject({
    listing_ids: [1],
    destination_tab_id: 42,
  });
});

it('omits destination_tab_id when entered without a tab (sidebar entry)', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  const page = render(
    <DuplicateConfirmation
      destinationCategory={null}
      destinationCourse={course}
      destinationTab={null}
      destinationTabId={null}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );
  fireEvent.click(await page.findByRole('button', { name: /Duplicate/ }));
  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  const body = JSON.parse(mock.history.post[0].data);
  expect(body).toMatchObject({ listing_ids: [1] });
  expect(body).not.toHaveProperty('destination_tab_id'); // backend then defaults to the first tab
});
