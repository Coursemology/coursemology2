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
  // Stand in for CourseContainer's outlet context so we can assert the wrapper
  // forwards it (useCourseContext() delegates to useOutletContext()).
  useOutletContext: () => ({ courseUrl: '/courses/1' }),
  // Render both the probe (for the singleton timing check) and the context the
  // wrapper forwarded via <Outlet context={...}> (for the forwarding check).
  Outlet: ({ context }: { context?: { courseUrl?: string } }): JSX.Element => (
    <>
      <Probe />
      <div>forwarded: {context?.courseUrl ?? 'none'}</div>
    </>
  ),
}));

// TestApp's I18nProvider loads locale messages via a dynamic import(), so the tree
// mounts asynchronously — the first assertion must be an async findBy/waitFor.
it('sets the preview singleton during render, before its child renders', async () => {
  render(<PreviewAttemptScope />);
  // The Probe reads getActivePreview() during ITS OWN render; seeing '5' proves the
  // wrapper set the singleton before the child rendered (i.e. in render, not an effect).
  expect(await screen.findByText('preview id: 5')).toBeInTheDocument();
});

it('forwards the course outlet context down to the child route', async () => {
  render(<PreviewAttemptScope />);
  // A bare <Outlet/> would null the context; this proves CourseLayoutData is forwarded
  // so the reused SubmissionEditIndex banner can read courseUrl on the preview page.
  expect(await screen.findByText('forwarded: /courses/1')).toBeInTheDocument();
});

it('clears the singleton on unmount', async () => {
  const { unmount } = render(<PreviewAttemptScope />);
  await screen.findByText('preview id: 5');
  expect(getActivePreview()).toBe(5);
  unmount();
  expect(getActivePreview()).toBeNull();
});
