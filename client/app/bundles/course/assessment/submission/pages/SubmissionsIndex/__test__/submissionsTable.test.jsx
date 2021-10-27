import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import SubmissionsTable from '../SubmissionsTable';

const defaultAssessmentProps = {
  canViewLogs: true,
  canUnsubmitSubmission: true,
  canDeleteAllSubmissions: true,
  downloadable: true,
  gamified: true,
  maximumGrade: 10,
  passwordProtected: true,
  title: 'Password Protected Exam',
};

const defaultProps = {
  assessment: defaultAssessmentProps,
  courseId: '1',
  assessmentId: '1',
  isDownloading: false,
  isStatisticsDownloading: false,
  isUnsubmitting: false,
  isDeleting: false,
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

const setupTest = (propsOverrides) => {
  const props = { ...defaultProps, ...propsOverrides };
  const submissionsTable = mount(
    <ProviderWrapper>
      <SubmissionsTable {...props} />
    </ProviderWrapper>,
  );

  return {
    props,
    submissionsTable,
    rowCount: submissionsTable.find('tr.submission-row'),
    logCount: submissionsTable.find('span.submission-access-logs'),
    unsubmitCount: submissionsTable.find('span.unsubmit-button'),
    deleteCount: submissionsTable.find('span.delete-button'),
  };
};

describe('<SubmissionsTable />', () => {
  describe('when canViewLogs, canUnsubmitSubmission and canDeleteAllSubmissions are set to true ', () => {
    it('renders the submissions table with access log links', () => {
      const assessmentProps = {
        ...defaultAssessmentProps,
        canViewLogs: true,
        canUnsubmitSubmission: true,
        canDeleteAllSubmissions: true,
      };
      const { rowCount, logCount, unsubmitCount, deleteCount } = setupTest({
        assessment: assessmentProps,
      });

      expect(rowCount).toHaveLength(1);
      expect(logCount).toHaveLength(1);
      expect(unsubmitCount).toHaveLength(1);
      expect(deleteCount).toHaveLength(1);
    });
  });

  describe('when canViewLogs, canUnsubmitSubmission and canDeleteAllSubmissions are set to false', () => {
    it('renders the submissions table without access log links', () => {
      const assessmentProps = {
        ...defaultAssessmentProps,
        canViewLogs: false,
        canUnsubmitSubmission: false,
        canDeleteAllSubmissions: false,
      };
      const { rowCount, logCount, unsubmitCount, deleteCount } = setupTest({
        assessment: assessmentProps,
      });

      expect(rowCount).toHaveLength(1);
      expect(logCount).toHaveLength(0);
      expect(unsubmitCount).toHaveLength(0);
      expect(deleteCount).toHaveLength(0);
    });
  });
});
