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
