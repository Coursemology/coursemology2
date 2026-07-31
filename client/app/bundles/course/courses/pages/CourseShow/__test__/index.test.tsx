import { createMockAdapter } from 'mocks/axiosMock';
import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { useCourseContext } from 'course/container/CourseLoader';

import CourseShow from '../index';

// `TestApp` mounts the component inside a `MemoryRouter` with no matching `<Route path=":courseId">`,
// so `useParams()` would otherwise be empty and the page would never fetch (mirrors
// marketplace/pages/ListingPreview/__test__).
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): jest.Mock => jest.fn(),
  useParams: (): { courseId: string } => ({
    courseId: global.courseId.toString(),
  }),
}));

// There is no CourseLayout outlet in the test, so the preview flag comes from a mocked hook
// (mirrors SubmissionEditIndex/components/button/__test__/PublishButton).
jest.mock('course/container/CourseLoader', () => ({
  useCourseContext: jest.fn(),
}));

const mockUseCourseContext = useCourseContext as jest.Mock;

const mock = createMockAdapter(CourseAPI.courses.client);
beforeEach(() => {
  mock.reset();
  mockUseCourseContext.mockReturnValue({ isPreview: false });
});

const DESCRIPTION = 'Welcome to the Marketplace Preview Sandbox';

const replyWithCourse = (
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => {
  const course = {
    id: Number(global.courseId),
    title: 'Marketplace Preview Sandbox',
    description: `<p>${DESCRIPTION}</p>`,
    logoUrl: '',
    instructors: [],
    registrationInfo: null,
    isSuspended: false,
    canSuspendCourse: false,
    isSuspendedUser: false,
    permissions: { isCurrentCourseUser: true, canManage: true },
    ...overrides,
  };

  mock.onGet(`/courses/${global.courseId}`).reply(200, { course });
  return course;
};

it('renders the course description inside the preview sandbox', async () => {
  mockUseCourseContext.mockReturnValue({ isPreview: true });
  replyWithCourse();

  render(<CourseShow />);

  await waitFor(() => expect(screen.getByText('Description')).toBeVisible());
  expect(screen.getByText(DESCRIPTION)).toBeVisible();
});

it('keeps the description hidden from an enrolled user of a normal course', async () => {
  replyWithCourse();

  render(<CourseShow />);

  // Nothing else renders for an enrolled user of an activity-free course, so wait for the fetch to
  // settle via the store rather than via an element.
  await waitFor(() => expect(mock.history.get).toHaveLength(1));
  expect(screen.queryByText('Description')).not.toBeInTheDocument();
});

it('still shows the description to a user who is not enrolled', async () => {
  replyWithCourse({
    permissions: { isCurrentCourseUser: false, canManage: false },
  });

  render(<CourseShow />);

  await waitFor(() => expect(screen.getByText('Description')).toBeVisible());
  expect(screen.getByText(DESCRIPTION)).toBeVisible();
  // The non-enrolled view is unchanged: description sits above the instructors section.
  expect(screen.getByText('Instructors')).toBeVisible();
});
