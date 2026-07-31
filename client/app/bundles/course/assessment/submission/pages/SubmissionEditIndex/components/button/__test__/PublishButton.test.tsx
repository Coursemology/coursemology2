import userEvent from '@testing-library/user-event';
import { render, screen } from 'test-utils';

import { publish } from 'course/assessment/submission/actions';
import { useCourseContext } from 'course/container/CourseLoader';

import PublishButton from '../PublishButton';

jest.mock('course/assessment/submission/actions', () => ({
  publish: jest.fn(() => (): Promise<void> => Promise.resolve()),
}));

jest.mock('course/container/CourseLoader', () => ({
  useCourseContext: jest.fn(),
}));

jest.mock('lib/helpers/url-helpers', () => ({
  ...jest.requireActual('lib/helpers/url-helpers'),
  getSubmissionId: (): string => '42',
}));

const mockPublish = publish as jest.Mock;
const mockUseCourseContext = useCourseContext as jest.Mock;

const buildState = (): object => ({
  assessments: {
    submission: {
      assessment: { delayedGradePublication: false },
      submission: { graderView: true, workflowState: 'submitted' },
      submissionFlags: { isSaving: false },
      grading: { questions: { 1: { grade: 10 } }, exp: 0 },
    },
  },
});

describe('PublishButton', () => {
  beforeEach(() => {
    mockPublish.mockClear();
  });

  it('threads isPreview through to publish() inside a preview course', async () => {
    mockUseCourseContext.mockReturnValue({ isPreview: true });
    const user = userEvent.setup();

    render(<PublishButton />, { state: buildState() });

    await user.click(await screen.findByRole('button'));

    expect(mockPublish).toHaveBeenCalledWith('42', [{ grade: 10 }], 0, true);
  });

  it('passes isPreview=false outside a preview course', async () => {
    mockUseCourseContext.mockReturnValue({ isPreview: false });
    const user = userEvent.setup();

    render(<PublishButton />, { state: buildState() });

    await user.click(await screen.findByRole('button'));

    expect(mockPublish).toHaveBeenCalledWith('42', [{ grade: 10 }], 0, false);
  });

  it('passes isPreview=undefined when rendered outside CourseContainer entirely', async () => {
    mockUseCourseContext.mockReturnValue(undefined);
    const user = userEvent.setup();

    render(<PublishButton />, { state: buildState() });

    await user.click(await screen.findByRole('button'));

    expect(mockPublish).toHaveBeenCalledWith(
      '42',
      [{ grade: 10 }],
      0,
      undefined,
    );
  });
});
