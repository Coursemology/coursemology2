import { createMockAdapter } from 'mocks/axiosMock';
import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import QuestionPreview from '../index';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: (): {
    listingId: string;
    questionId: string;
    courseId: string;
  } => ({
    listingId: '7',
    questionId: '3',
    courseId: global.courseId.toString(),
  }),
}));

const mock = createMockAdapter(CourseAPI.marketplace.client);
beforeEach(() => mock.reset());

it('renders the question and dispatches to the type-specific renderer', async () => {
  const url = `/courses/${global.courseId}/marketplace/listings/7/questions/3`;
  mock.onGet(url).reply(200, {
    id: 3,
    title: 'Sorting in Python',
    defaultTitle: 'Question 1',
    description: '<p>Implement sort</p>',
    staffOnlyComments: '',
    maximumGrade: 10,
    type: 'Programming',
    displayType: 'Programming',
    detail: {
      languageName: 'Python 3.10',
      memoryLimit: 32,
      timeLimit: 10,
      templateFiles: [{ filename: 'main.py', content: 'print(1)' }],
      publicTestCases: [],
      privateTestCases: [],
      evaluationTestCases: [],
    },
  });

  render(<QuestionPreview />, { at: [url] });

  await waitFor(() =>
    expect(screen.getByDisplayValue('Sorting in Python')).toBeVisible(),
  );
  // The human-readable type chip (displayType) renders beside the Title field.
  expect(screen.getByText('Programming')).toBeVisible();
  // Shell renders the reused "Grading" section + "Maximum grade" label around the renderer.
  expect(screen.getByText('Grading')).toBeVisible();
  expect(screen.getByText('Maximum grade')).toBeVisible();
  expect(screen.getByTestId('renderer-Programming')).toBeInTheDocument();
});
