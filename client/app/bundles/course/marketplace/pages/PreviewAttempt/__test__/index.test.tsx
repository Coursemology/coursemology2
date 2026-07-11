import userEvent from '@testing-library/user-event';
import { createMockAdapter } from 'mocks/axiosMock';
import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import {
  clearPreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';

import PreviewAttempt from '../index';

jest.mock('course/assessment/submission/pages/SubmissionEditIndex', () => {
  const SubmissionEditIndex = (): JSX.Element => <div>Submission page</div>;
  SubmissionEditIndex.displayName = 'SubmissionEditIndex';

  return SubmissionEditIndex;
});

jest.mock('course/container/CourseLoader', () => ({
  useCourseContext: (): { courseTitle: string; courseUrl: string } => ({
    courseTitle: 'Visible Course',
    courseUrl: '/courses/2',
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: (): { listingTitle: string } => ({
    listingTitle: '[MP] Grand mix',
  }),
  useParams: (): { listingId: string } => ({ listingId: '10' }),
}));

const mock = createMockAdapter(CourseAPI.marketplace.client);

beforeEach(() => {
  mock.reset();
  clearPreviewIdentity();
  window.history.pushState(
    {},
    '',
    '/courses/2/marketplace/listings/10/attempt',
  );
});

afterEach(() => clearPreviewIdentity());

it('duplicates from the visible course while the submission page uses the preview identity', async () => {
  const user = userEvent.setup();
  setPreviewIdentity({ courseId: 14, assessmentId: 65, submissionId: 8190 });
  mock
    .onPost('/courses/2/marketplace/listings/duplicate')
    .reply(200, { status: 'submitted', jobUrl: '/jobs/9' });

  render(<PreviewAttempt />);

  await user.click(
    await screen.findByRole('button', { name: 'Duplicate into my course' }),
  );
  await user.click(screen.getByRole('button', { name: /^Duplicate$/ }));

  await waitFor(() => expect(mock.history.post).toHaveLength(1));
  expect(mock.history.post[0].url).toBe(
    '/courses/2/marketplace/listings/duplicate',
  );
});
