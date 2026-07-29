import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, waitFor, within } from 'test-utils';

import CourseAPI from 'api/course';

import PublishToMarketplaceButton from '../PublishToMarketplaceButton';

const confirmInDialog = async (
  page: ReturnType<typeof render>,
  name: RegExp,
): Promise<void> => {
  const dialog = await page.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name }));
};

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

const assessmentAt = (
  isPublishedToMarketplace: boolean,
  canPublishToMarketplace = true,
): never =>
  ({
    id: 5,
    isPublishedToMarketplace,
    permissions: { canPublishToMarketplace },
  }) as never;

const url = `/courses/${global.courseId}/assessments/5/marketplace_listing`;

it('renders nothing when the user cannot publish', () => {
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(false, false)}
      onChange={jest.fn()}
    />,
  );
  expect(page.queryByText('Publish to Marketplace')).not.toBeInTheDocument();
  expect(page.queryByText('Remove from Marketplace')).not.toBeInTheDocument();
});

it('publishes after confirming and reports published=true', async () => {
  mock.onPost(url).reply(200, { published: true });
  const onChange = jest.fn();
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(false)}
      onChange={onChange}
    />,
  );

  // findByText: test-utils wraps the tree in a translations Suspense whose fallback is a
  // LoadingIndicator; the trigger button only exists after messages resolve.
  fireEvent.click(await page.findByText('Publish to Marketplace')); // trigger button
  await confirmInDialog(page, /Publish to Marketplace/); // primary button inside the Prompt
  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(onChange).toHaveBeenCalledWith(true);
});

const versionsUrl = `/courses/${global.courseId}/assessments/5/marketplace_listing/versions`;

it('offers Publish new version when already listed', async () => {
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(true)}
      onChange={jest.fn()}
    />,
  );

  expect(await page.findByText('Publish new version')).toBeInTheDocument();
});

// Separate test, not a second render in the one above: RTL binds queries to `document.body`, so
// two renders in a single test see each other's DOM and the negative assertion never fails.
it('does not offer Publish new version when unlisted', async () => {
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(false)}
      onChange={jest.fn()}
    />,
  );

  expect(await page.findByText('Publish to Marketplace')).toBeInTheDocument();
  expect(page.queryByText('Publish new version')).not.toBeInTheDocument();
});

it('cuts a new version after confirming', async () => {
  mock.onPost(versionsUrl).reply(200, { version: 2 });
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(true)}
      onChange={jest.fn()}
    />,
  );

  fireEvent.click(await page.findByText('Publish new version'));
  await confirmInDialog(page, /Publish new version/);
  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(mock.history.post[0].url).toBe(versionsUrl);
});

it('removes after confirming when already listed, reports published=false', async () => {
  mock.onDelete(url).reply(200);
  const onChange = jest.fn();
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(true)}
      onChange={onChange}
    />,
  );

  fireEvent.click(await page.findByText('Remove from Marketplace')); // trigger button
  await confirmInDialog(page, /Remove from Marketplace/); // primary button inside the Prompt
  await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  expect(onChange).toHaveBeenCalledWith(false);
});

it('surfaces an error and keeps the dialog open when publishing fails', async () => {
  mock.onPost(url).reply(422, { errors: ['nope'] });
  const onChange = jest.fn();
  const page = render(
    <PublishToMarketplaceButton
      assessment={assessmentAt(false)}
      onChange={onChange}
    />,
  );

  fireEvent.click(await page.findByText('Publish to Marketplace'));
  await confirmInDialog(page, /Publish to Marketplace/);
  await waitFor(() => expect(mock.history.post).toHaveLength(1));

  expect(await page.findByText(/Failed to publish/i)).toBeVisible(); // error toast
  expect(page.getByRole('dialog')).toBeVisible(); // still open, so the user can retry
  expect(onChange).not.toHaveBeenCalled();
});
