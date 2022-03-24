import { defineMessages } from 'react-intl';

const translations = defineMessages({
  accessLogs: {
    id: 'course.assessment.submission.submissions.accessLogs',
    defaultMessage: 'Access Logs',
  },
  dateGraded: {
    id: 'course.assessment.submission.submissions.dateGraded',
    defaultMessage: 'Graded At',
  },
  dateSubmitted: {
    id: 'course.assessment.submission.submissions.dateSubmitted',
    defaultMessage: 'Submitted At',
  },
  deleteAllSubmissions: {
    id: 'course.assessment.submission.deleteAllSubmissions',
    defaultMessage: 'Delete All Submissions',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.deleteConfirmation',
    defaultMessage:
      'Are you sure you want to DELETE the submission for {name}? \
                    This will delete all attempts, past answers and submissions and the user \
                    will need to re-attempt all questions. NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
  deleteSubmission: {
    id: 'course.assessment.submission.deleteSubmission',
    defaultMessage: 'Delete submission',
  },
  grader: {
    id: 'course.assessment.submission.submissions.grader',
    defaultMessage: 'Grader(s)',
  },
  download: {
    id: 'course.assessment.submission.submissions.download',
    defaultMessage: 'Download',
  },
  downloadCsvAnswers: {
    id: 'course.assessment.submission.submissions.downloadCsvAnswers',
    defaultMessage: 'Download Answers (CSV)',
  },
  downloadStatistics: {
    id: 'course.assessment.submission.submissions.downloadStatistics',
    defaultMessage: 'Download Statistics',
  },
  downloadZipAnswers: {
    id: 'course.assessment.submission.submissions.downloadZipAnswers',
    defaultMessage: 'Download Answers (Files)',
  },
  experiencePoints: {
    id: 'course.assessment.submission.submissions.experiencePoints',
    defaultMessage: 'Experience Points Awarded',
  },
  forceSubmit: {
    id: 'course.assessment.submission.submissions.forceSubmit',
    defaultMessage: 'Force Submit Remaining',
  },
  grade: {
    id: 'course.assessment.submission.submissions.grade',
    defaultMessage: 'Total Grade',
  },
  includePhantoms: {
    id: 'course.assessment.submission.submissions.includePhantoms',
    defaultMessage: 'Include phantom users',
  },
  myStudents: {
    id: 'course.assessment.submission.submissions.myStudents',
    defaultMessage: 'My Students',
  },
  phantom: {
    id: 'course.assessment.submission.submissions.phantom',
    defaultMessage: 'Phantom User',
  },
  publishGrades: {
    id: 'course.assessment.submission.submissions.publishGrades',
    defaultMessage: 'Publish Grades',
  },
  publishNotice: {
    id: 'course.assessment.submission.submissions.publishNotice',
    defaultMessage:
      'The grade and experience points are not visible to the student. \
                    Publish all grades by clicking the button at the top of this page.',
  },
  remind: {
    id: 'course.assessment.submission.submissions.remind',
    defaultMessage: 'Send Reminder Emails',
  },
  staff: {
    id: 'course.assessment.submission.submissions.staff',
    defaultMessage: 'Staff',
  },
  students: {
    id: 'course.assessment.submission.submissions.students',
    defaultMessage: 'Students',
  },
  submissionStatus: {
    id: 'course.assessment.submission.submissions.submissionStatus',
    defaultMessage: 'Submission Status',
  },
  unsubmitAllSubmissions: {
    id: 'course.assessment.submission.unsubmitAllSubmissions',
    defaultMessage: 'Unsubmit All Submissions',
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
  userName: {
    id: 'course.assessment.submission.submissions.userName',
    defaultMessage: 'Name',
  },
});

export default translations;
