import userEvent from '@testing-library/user-event';
import { render, screen } from 'test-utils';

import PreviewBanner from '../PreviewBanner';

it('names the listing and explains that the preview is a sandbox', async () => {
  render(
    <PreviewBanner listingTitle="[MP] Grand mix" onDuplicate={jest.fn()} />,
  );

  expect(await screen.findByText(/\[MP\] Grand mix/)).toBeVisible();
  expect(screen.getByText(/sandbox copy/i)).toBeVisible();
  expect(screen.getByText(/no one else can see it/i)).toBeVisible();
});

// Load-bearing, not decoration: PreviewGradingPolicy withholds the paid graders, so without this
// line an instructor rehearsing the grading flow concludes autograding is broken.
it('warns that AI-graded questions are not auto-graded here', async () => {
  render(
    <PreviewBanner listingTitle="[MP] Grand mix" onDuplicate={jest.fn()} />,
  );

  expect(await screen.findByText(/aren’t auto-graded/i)).toBeVisible();
});

it('offers the duplicate action — the conversion point of the whole feature', async () => {
  const user = userEvent.setup();
  const onDuplicate = jest.fn();
  render(
    <PreviewBanner listingTitle="[MP] Grand mix" onDuplicate={onDuplicate} />,
  );

  await user.click(
    await screen.findByRole('button', { name: 'Duplicate into my course' }),
  );

  expect(onDuplicate).toHaveBeenCalled();
});
