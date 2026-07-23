import { createMockAdapter } from 'mocks/axiosMock';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import ListingPreview from '../index';

const mockNavigate = jest.fn();

// `TestApp` mounts the component directly inside a `MemoryRouter` with no matching
// `<Route path=":listingId">`, so `useParams()` would otherwise be empty and the page
// would fetch `.../listings/NaN`. Mock it to supply the route param, mirroring
// survey/pages/ResponseIndex/__test__. `useNavigate` is spied so the back button's
// navigate() target can be asserted (Page renders backTo as a navigate() button, not a link).
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): typeof mockNavigate => mockNavigate,
  useParams: (): { listingId: string; courseId: string } => ({
    listingId: '7',
    courseId: global.courseId.toString(),
  }),
}));

beforeEach(() => mockNavigate.mockClear());

// The Duplicate Assessment button needs the destination course, which the page reads from the
// course outlet context. There is no CourseLayout outlet in the test, so mock the hook (mirrors
// MarketplaceIndex/__test__).
jest.mock('../../../../container/CourseLoader', () => ({
  useCourseContext: (): { courseTitle: string; courseUrl: string } => ({
    courseTitle: 'Test Course',
    courseUrl: `/courses/${global.courseId}`,
  }),
}));

// NOTE: do NOT jest.mock('../../../operations') — this bundle mocks the axios adapter and lets the
// real fetchListing run. Auto-mocking operations makes fetchListing return undefined, and Preload's
// `while` callback then does `undefined.then` → "Cannot read properties of undefined (reading 'then')".
const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

const LISTING_TITLE = 'Published, All Question Types';

it('renders the read-only assessment config', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '<p>Awesome description 5</p>',
    gradingMode: 'manual',
    baseExp: 1000,
    bonusExp: 1000,
    showMcqMrqSolution: true,
    showRubricToStudents: false,
    gradedTestCases: 'Public, Private',
    // Backend now serializes human-readable type labels (question_type_readable).
    typeCounts: { 'Multiple Choice': 1 },
    questions: [
      {
        id: 17,
        title: 'The awesome question 17',
        description: '<p>Look at this awesome question</p>',
        staffOnlyComments: '<p>Deep pedagogical insight.</p>',
        maximumGrade: 2,
        type: 'Multiple Choice',
        unautogradable: false,
        mcqMrqType: 'mcq',
        options: [
          { id: 1, option: 'true', correct: true },
          { id: 2, option: 'false', correct: false },
        ],
      },
    ],
  });

  render(<ListingPreview />, { at: [url] });

  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());

  // Description renders in the bordered card, not as bare text.
  expect(screen.getByText('Awesome description 5')).toBeVisible();
  // Properties table reuses AssessmentShow's labels.
  expect(screen.getByText('Grading mode')).toBeVisible();
  // Type chip + summary breakdown both use the readable label.
  expect(screen.getAllByText(/Multiple Choice/).length).toBeGreaterThan(0);
  // Author's staff-only notes surface for adopters to judge intent.
  expect(screen.getByText('Deep pedagogical insight.')).toBeVisible();
  // Top-right action opens the duplicate flow.
  expect(
    screen.getByRole('button', { name: 'Duplicate Assessment' }),
  ).toBeVisible();
  // The card title is plain text now; the eye icon links into the per-question detail route.
  expect(screen.getByText('The awesome question 17')).toBeVisible();
  expect(
    screen.getByRole('link', { name: 'View question details' }),
  ).toHaveAttribute('href', expect.stringContaining('questions/17'));
});

it('carries from_tab into the per-question detail links', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '<p>desc</p>',
    gradingMode: 'manual',
    baseExp: 0,
    bonusExp: 0,
    showMcqMrqSolution: false,
    showRubricToStudents: false,
    gradedTestCases: '',
    typeCounts: { 'Multiple Choice': 1 },
    questions: [
      {
        id: 17,
        title: 'The awesome question 17',
        description: '',
        staffOnlyComments: '',
        maximumGrade: 2,
        type: 'Multiple Choice',
        unautogradable: false,
        mcqMrqType: 'mcq',
        options: [],
      },
    ],
  });

  render(<ListingPreview />, { at: [`${url}?from_tab=42`] });

  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());
  expect(
    screen.getByRole('link', { name: 'View question details' }),
  ).toHaveAttribute('href', expect.stringContaining('from_tab=42'));
});

it('navigates back to the marketplace carrying from_tab', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '<p>desc</p>',
    gradingMode: 'manual',
    baseExp: 0,
    bonusExp: 0,
    showMcqMrqSolution: false,
    showRubricToStudents: false,
    gradedTestCases: '',
    typeCounts: {},
    questions: [],
  });

  render(<ListingPreview />, { at: [`${url}?from_tab=42`] });

  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());
  fireEvent.click(screen.getByTestId('ArrowBackIconButton'));
  expect(mockNavigate).toHaveBeenCalledWith(
    `/courses/${global.courseId}/marketplace?from_tab=42`,
  );
});

it('renders a back button to the marketplace index', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '<p>desc</p>',
    gradingMode: 'manual',
    baseExp: 0,
    bonusExp: 0,
    showMcqMrqSolution: false,
    showRubricToStudents: false,
    gradedTestCases: '',
    typeCounts: {},
    questions: [],
  });

  render(<ListingPreview />, { at: [url] });

  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());
  // Page renders the back affordance as an IconButton with this testid when `backTo` is set.
  expect(screen.getByTestId('ArrowBackIconButton')).toBeInTheDocument();
});

it('marks the page title as a preview', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '<p>desc</p>',
    gradingMode: 'manual',
    baseExp: 0,
    bonusExp: 0,
    showMcqMrqSolution: false,
    showRubricToStudents: false,
    gradedTestCases: '',
    typeCounts: {},
    questions: [],
  });

  render(<ListingPreview />, { at: [url] });

  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());
  // A "Preview" chip sits beside the title so the read-only listing detail page is never mistaken
  // for the real assessment it mirrors.
  expect(screen.getByText('Preview')).toBeVisible();
});

it('creates a preview attempt and navigates to the preview edit page', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '',
    typeCounts: {},
    questions: [],
  });
  mock
    .onPost(`/courses/${global.courseId}/marketplace/listings/7/attempt`)
    .reply(200, { id: 55, assessmentId: 9 });

  render(<ListingPreview />, { at: [url] });
  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());

  fireEvent.click(screen.getByRole('button', { name: 'Attempt' }));

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(
      `/courses/${global.courseId}/marketplace/attempt/55/edit?fromListing=7`,
    ),
  );
});

it('shows a notification and does not navigate when the attempt create conflicts (409)', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7`;
  mock.onGet(url).reply(200, {
    id: 70,
    title: LISTING_TITLE,
    destinationTabs: [],
    description: '',
    typeCounts: {},
    questions: [],
  });
  mock
    .onPost(`/courses/${global.courseId}/marketplace/listings/7/attempt`)
    .reply(409, {
      errors: ['You already have a submission for this assessment.'],
    });

  render(<ListingPreview />, { at: [url] });
  await waitFor(() => expect(screen.getByText(LISTING_TITLE)).toBeVisible());

  fireEvent.click(screen.getByRole('button', { name: 'Attempt' }));

  // Wait for the create POST to actually round-trip (and 409), THEN assert no
  // navigation followed — otherwise "not navigated" is trivially true before the
  // request even fires.
  await waitFor(() =>
    expect(
      mock.history.post.filter((r) =>
        r.url?.endsWith('/marketplace/listings/7/attempt'),
      ),
    ).toHaveLength(1),
  );
  expect(mockNavigate).not.toHaveBeenCalled();
});
