import { render } from 'test-utils';

import SubmissionsTable from '../SubmissionsTable';

const defaultAssessmentProps = {
  canViewLogs: true,
  canUnsubmitSubmission: true,
  canDeleteAllSubmissions: true,
  filesDownloadable: true,
  csvDownloadable: true,
  gamified: true,
  maximumGrade: 10,
  passwordProtected: true,
  title: 'Password Protected Exam',
};

const defaultProps = {
  assessment: defaultAssessmentProps,
  courseId: '1',
  assessmentId: '1',
  isDownloadingFiles: false,
  isDownloadingCsv: false,
  isStatisticsDownloading: false,
  isUnsubmitting: false,
  isDeleting: false,
  isReminding: false,
  isActive: true,
  dispatch: () => {},
  submissions: [
    {
      id: 1,
      workflowState: 'submitted',
      grade: 10,
      pointsAwarded: 100,
      dateSubmitted: '2018-03-08T18:46:59.292+08:00',
      dateGraded: '2018-04-08T18:46:59.292+08:00',
      courseUser: {
        id: 1,
        myStudent: false,
        name: 'John',
        path: '/foo',
        phantom: false,
      },
    },
  ],
};

describe('<SubmissionsTable />', () => {
  describe('when canViewLogs, canUnsubmitSubmission and canDeleteAllSubmissions are set to true ', () => {
    it('renders the submissions table with access log links', async () => {
      const page = render(
        <SubmissionsTable
          {...defaultProps}
          assessment={{
            ...defaultAssessmentProps,
            canViewLogs: true,
            canUnsubmitSubmission: true,
            canDeleteAllSubmissions: true,
          }}
        />,
      );

      expect((await page.findByText('John')).closest('tr')).toBeVisible();
      expect(page.getByTestId('HistoryIcon').closest('button')).toBeVisible();
      expect(page.getByTestId('DeleteIcon').closest('button')).toBeVisible();
      expect(
        page.getByTestId('RemoveCircleIcon').closest('button'),
      ).toBeVisible();
    });
  });

  describe('when canViewLogs, canUnsubmitSubmission and canDeleteAllSubmissions are set to false', () => {
    it('renders the submissions table without access log links', async () => {
      const page = render(
        <SubmissionsTable
          {...defaultProps}
          assessment={{
            ...defaultAssessmentProps,
            canViewLogs: false,
            canUnsubmitSubmission: false,
            canDeleteAllSubmissions: false,
          }}
        />,
      );

      expect((await page.findByText('John')).closest('tr')).toBeVisible();
      expect(page.queryByTestId('HistoryIcon')).not.toBeInTheDocument();
      expect(page.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
      expect(page.queryByTestId('RemoveCircleIcon')).not.toBeInTheDocument();
    });
  });
});
