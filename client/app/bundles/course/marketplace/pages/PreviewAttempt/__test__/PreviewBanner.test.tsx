import userEvent from '@testing-library/user-event';
import { render, screen } from 'test-utils';

import PreviewBanner from '../PreviewBanner';

it('names the listing and explains it is a private sandbox', async () => {
  render(
    <PreviewBanner
      listingTitle="[MP] Grand mix"
      onDuplicate={jest.fn()}
      previewGradingInert={false}
    />,
  );

  expect(await screen.findByText(/\[MP\] Grand mix/)).toBeVisible();
  expect(screen.getByText(/private sandbox/i)).toBeVisible();
  expect(screen.getByText(/nothing you enter is kept/i)).toBeVisible();
});

// The caveat is load-bearing when it shows: PreviewGradingPolicy withholds the paid graders, so
// without it an instructor rehearsing grading concludes autograding is broken.
it('warns that auto-grading is off when the preview has AI-graded questions', async () => {
  render(
    <PreviewBanner
      listingTitle="[MP] Grand mix"
      onDuplicate={jest.fn()}
      previewGradingInert
    />,
  );

  expect(await screen.findByText(/auto-grading is off/i)).toBeVisible();
});

// The whole point of "only when relevant": no caveat when nothing here is AI-graded, so an
// assessment of MCQs does not carry a confusing note about graders it never uses.
it('omits the caveat when the preview has no AI-graded questions', async () => {
  render(
    <PreviewBanner
      listingTitle="[MP] Grand mix"
      onDuplicate={jest.fn()}
      previewGradingInert={false}
    />,
  );

  // Await the always-present line so the async I18n mount has completed before we assert absence.
  expect(await screen.findByText(/private sandbox/i)).toBeVisible();
  expect(screen.queryByText(/auto-grading is off/i)).not.toBeInTheDocument();
});

it('offers the duplicate action — the conversion point of the whole feature', async () => {
  const user = userEvent.setup();
  const onDuplicate = jest.fn();
  render(
    <PreviewBanner
      listingTitle="[MP] Grand mix"
      onDuplicate={onDuplicate}
      previewGradingInert={false}
    />,
  );

  await user.click(
    await screen.findByRole('button', { name: 'Duplicate into my course' }),
  );

  expect(onDuplicate).toHaveBeenCalled();
});
