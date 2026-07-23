import { getActivePreview } from 'api/course/Assessment/previewAttemptContext';
import { render, screen } from 'test-utils';

import PreviewAttemptScope from '../index';

// Assert the singleton is set during render (before effects). A child that reads
// getActivePreview() during its own render must see the value already set, proving
// the wrapper does not defer it to a useEffect.
const Probe = (): JSX.Element => <div>preview id: {String(getActivePreview())}</div>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ submissionId: '5' }),
  useSearchParams: () => [new URLSearchParams('fromListing=7'), jest.fn()],
  Outlet: () => <Probe />,
}));

// TestApp's I18nProvider loads locale messages via a dynamic import(), so the tree
// mounts asynchronously — the first assertion must be an async findBy/waitFor.
it('sets the preview singleton during render, before its child renders', async () => {
  render(<PreviewAttemptScope />);
  // The Probe reads getActivePreview() during ITS OWN render; seeing '5' proves the
  // wrapper set the singleton before the child rendered (i.e. in render, not an effect).
  expect(await screen.findByText('preview id: 5')).toBeInTheDocument();
});

it('clears the singleton on unmount', async () => {
  const { unmount } = render(<PreviewAttemptScope />);
  await screen.findByText('preview id: 5');
  expect(getActivePreview()).toBe(5);
  unmount();
  expect(getActivePreview()).toBeNull();
});
