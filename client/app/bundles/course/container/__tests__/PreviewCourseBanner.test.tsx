import { render, screen } from 'test-utils';

import PreviewCourseBanner from '../PreviewCourseBanner';

const SANDBOX_NOTICE = /marketplace preview sandbox/i;

const goTo = (path: string): void => window.history.pushState({}, '', path);

beforeEach(() => {
  // Reset to the bare course-home URL `setup.js` establishes globally, so each test starts from
  // "no submission id in the route" unless it navigates somewhere else itself.
  goTo(`/courses/${global.courseId}`);
});

describe('PreviewCourseBanner', () => {
  it('renders the marketplace preview sandbox notice inside a submission', async () => {
    goTo(`/courses/${global.courseId}/assessments/5/submissions/9/edit`);
    render(<PreviewCourseBanner />);
    expect(await screen.findByText(SANDBOX_NOTICE)).toBeVisible();
  });

  // Pinned separately from the label above: the notice used to claim the sandbox was "read-only" on
  // the one page where a previewer types answers and submits them, so what it promises matters more
  // than that it appeared.
  it('promises that the work stays in the sandbox', async () => {
    goTo(`/courses/${global.courseId}/assessments/5/submissions/9/edit`);
    render(<PreviewCourseBanner />);

    expect(await screen.findByText(/never reach a real course/i)).toBeVisible();
  });

  it('renders nothing on the course home page', () => {
    render(<PreviewCourseBanner />);
    expect(screen.queryByText(SANDBOX_NOTICE)).not.toBeInTheDocument();
  });

  it('renders nothing on the assessments index', () => {
    goTo(`/courses/${global.courseId}/assessments`);
    render(<PreviewCourseBanner />);
    expect(screen.queryByText(SANDBOX_NOTICE)).not.toBeInTheDocument();
  });

  it("renders nothing on an assessment's own show page", () => {
    goTo(`/courses/${global.courseId}/assessments/5`);
    render(<PreviewCourseBanner />);
    expect(screen.queryByText(SANDBOX_NOTICE)).not.toBeInTheDocument();
  });
});

// Mirrors the exact conditional mounted in CourseContainer.tsx:
// `{data.isPreview && <PreviewCourseBanner />}`. CourseContainer itself pulls
// its data from a react-router loader, so it isn't worth a full-container
// mock scaffold just to prove this one boolean gate.
//
// The gate is `isPreview`, not the narrower `isPreviewRestricted` that de-links
// the breadcrumbs and sidebar: the banner states a fact about the course, so a
// system administrator sees it too (see Course::CoursesController#sidebar) —
// but only on the pages where it is true of what they are looking at, which the
// banner itself decides (see the suite above).
const Gated = ({ isPreview }: { isPreview?: boolean }): JSX.Element => (
  <>
    <div data-testid="marker" />
    {isPreview && <PreviewCourseBanner />}
  </>
);

describe('the isPreview gate mounted in CourseContainer', () => {
  beforeEach(() => {
    goTo(`/courses/${global.courseId}/assessments/5/submissions/9/edit`);
  });

  it('shows the banner when isPreview is true', async () => {
    render(<Gated isPreview />);
    expect(await screen.findByText(SANDBOX_NOTICE)).toBeVisible();
  });

  it('does not show the banner when isPreview is false', async () => {
    render(<Gated isPreview={false} />);
    expect(await screen.findByTestId('marker')).toBeInTheDocument();
    expect(screen.queryByText(SANDBOX_NOTICE)).not.toBeInTheDocument();
  });

  it('does not show the banner when isPreview is undefined', async () => {
    render(<Gated />);
    expect(await screen.findByTestId('marker')).toBeInTheDocument();
    expect(screen.queryByText(SANDBOX_NOTICE)).not.toBeInTheDocument();
  });
});
