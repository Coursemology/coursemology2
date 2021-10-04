import { defineMessages } from 'react-intl';

const translations = defineMessages({
  publishNotice: {
    id: 'course.assessment.submission.submissions.publishNotice',
    defaultMessage:
      'The grade and experience points are not visible to the student. \
                    Publish all grades by clicking the button at the top of this page.',
  },
  userName: {
    id: 'course.assessment.submission.submissions.userName',
    defaultMessage: 'Name',
  },
  submissionStatus: {
    id: 'course.assessment.submission.submissions.submissionStatus',
    defaultMessage: 'Submission Status',
  },
  grade: {
    id: 'course.assessment.submission.submissions.grade',
    defaultMessage: 'Total Grade',
  },
  experiencePoints: {
    id: 'course.assessment.submission.submissions.experiencePoints',
    defaultMessage: 'Experience Points Awarded',
  },
  dateSubmitted: {
    id: 'course.assessment.submission.submissions.dateSubmitted',
    defaultMessage: 'Submitted At',
  },
  dateGraded: {
    id: 'course.assessment.submission.submissions.dateGraded',
    defaultMessage: 'Graded At',
  },
  download: {
    id: 'course.assessment.submission.submissions.download',
    defaultMessage: 'Download',
  },
  downloadAnswers: {
    id: 'course.assessment.submission.submissions.downloadAnswers',
    defaultMessage: 'Download Answers',
  },
  downloadStatistics: {
    id: 'course.assessment.submission.submissions.downloadStatistics',
    defaultMessage: 'Download Statistics',
  },
  accessLogs: {
    id: 'course.assessment.submission.submissions.accessLogs',
    defaultMessage: 'Access Logs',
  },
  myStudents: {
    id: 'course.assessment.submission.submissions.myStudents',
    defaultMessage: 'My Students',
  },
  students: {
    id: 'course.assessment.submission.submissions.students',
    defaultMessage: 'Students',
  },
  staff: {
    id: 'course.assessment.submission.submissions.staff',
    defaultMessage: 'Staff',
  },
  publishGrades: {
    id: 'course.assessment.submission.submissions.publishGrades',
    defaultMessage: 'Publish Grades',
  },
  includePhantoms: {
    id: 'course.assessment.submission.submissions.includePhantoms',
    defaultMessage: 'Include phantom users',
  },
  phantom: {
    id: 'course.assessment.submission.submissions.phantom',
    defaultMessage: 'Phantom User',
  },
  unsubmitAllSubmissions: {
    id: 'course.assessment.submission.unsubmitAllSubmissions',
    defaultMessage: 'Unsubmit all submission',
  },
  unsubmitSubmission: {
    id: 'course.assessment.submission.unsubmitSubmission',
    defaultMessage: 'Unsubmit submission',
  },
  unsubmitConfirmation: {
    id: 'course.assessment.submission.unsubmitConfirmation',
    defaultMessage:
      'Are you sure you want to UNSUBMIT the submission for {name}? \
                    This will reset the submission time and permit the user to change \
                    their submission. NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
  deleteAllSubmissions: {
    id: 'course.assessment.submission.deleteAllSubmissions',
    defaultMessage: 'Delete all submission',
  },
  deleteSubmission: {
    id: 'course.assessment.submission.deleteSubmission',
    defaultMessage: 'Delete submission',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.deleteConfirmation',
    defaultMessage:
      'Are you sure you want to DELETE the submission for {name}? \
                    This will delete all attempts, past answers and submissions and the user \
                    will need to re-attempt all questions. NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
});

export default translations;
