import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import DuplicateConfirmation from '../DuplicateConfirmation';

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

const listings = [{ id: 1, title: 'Recursion Drills' }];
const url = `/courses/${global.courseId}/marketplace/listings/duplicate`;

it('posts a duplication request with the destination tab on confirm', async () => {
  mock.onPost(url).reply(200, { status: 'submitted', jobUrl: '/jobs/9' });
  const page = render(
    <DuplicateConfirmation
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

// A request that never reaches the queue leaves no job to poll, so nothing else can re-enable the
// prompt: the confirm button has to come back by itself for the user to be able to retry.
it('re-enables the prompt when the request itself fails', async () => {
  mock.onPost(url).reply(500);
  const page = render(
    <DuplicateConfirmation
      destinationTabId={42}
      listings={listings}
      onClose={jest.fn()}
      open
    />,
  );
  const button = await page.findByRole('button', { name: /Duplicate/ });
  fireEvent.click(button);
  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  await waitFor(() => expect(button).not.toBeDisabled());
});
