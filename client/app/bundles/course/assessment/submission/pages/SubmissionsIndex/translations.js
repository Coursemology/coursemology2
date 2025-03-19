import { defineMessages } from 'react-intl';

const translations = defineMessages({
  publishNotice: {
    id: 'course.assessment.submission.SubmissionsIndex.publishNotice',
    defaultMessage:
      'The grade and experience points are not visible to the student. \
                    Publish all grades by clicking the button at the top of this page.',
  },
  userName: {
    id: 'course.assessment.submission.SubmissionsIndex.userName',
    defaultMessage: 'Name',
  },
  submissionStatus: {
    id: 'course.assessment.submission.SubmissionsIndex.submissionStatus',
    defaultMessage: 'Status',
  },
  grade: {
    id: 'course.assessment.submission.SubmissionsIndex.grade',
    defaultMessage: 'Total Grade',
  },
  experiencePoints: {
    id: 'course.assessment.submission.SubmissionsIndex.experiencePoints',
    defaultMessage: 'EXP Awarded',
  },
  dateSubmitted: {
    id: 'course.assessment.submission.SubmissionsIndex.dateSubmitted',
    defaultMessage: 'Submitted At',
  },
  dateGraded: {
    id: 'course.assessment.submission.SubmissionsIndex.dateGraded',
    defaultMessage: 'Graded At',
  },
  grader: {
    id: 'course.assessment.submission.SubmissionsIndex.grader',
    defaultMessage: 'Grader(s)',
  },
  download: {
    id: 'course.assessment.submission.SubmissionsIndex.download',
    defaultMessage: 'Download',
  },
  downloadZipAnswers: {
    id: 'course.assessment.submission.SubmissionsIndex.downloadZipAnswers',
    defaultMessage: 'Download Answers (Files)',
  },
  downloadCsvAnswers: {
    id: 'course.assessment.submission.SubmissionsIndex.downloadCsvAnswers',
    defaultMessage: 'Download Answers (CSV)',
  },
  downloadStatistics: {
    id: 'course.assessment.submission.SubmissionsIndex.downloadStatistics',
    defaultMessage: 'Download Statistics',
  },
  accessLogs: {
    id: 'course.assessment.submission.SubmissionsIndex.accessLogs',
    defaultMessage: 'Access Logs',
  },
  myStudents: {
    id: 'course.assessment.submission.SubmissionsIndex.myStudents',
    defaultMessage: 'My Students',
  },
  students: {
    id: 'course.assessment.submission.SubmissionsIndex.students',
    defaultMessage: 'Students',
  },
  staff: {
    id: 'course.assessment.submission.SubmissionsIndex.staff',
    defaultMessage: 'Staff',
  },
  publishGrades: {
    id: 'course.assessment.submission.SubmissionsIndex.publishGrades',
    defaultMessage: 'Publish Grades',
  },
  forceSubmit: {
    id: 'course.assessment.submission.SubmissionsIndex.forceSubmit',
    defaultMessage: 'Force Submit Remaining',
  },
  fetchFromKoditsu: {
    id: 'course.assessment.submission.SubmissionsIndex.fetchFromKoditsu',
    defaultMessage: 'Fetch Submissions from Koditsu',
  },
  remind: {
    id: 'course.assessment.submission.SubmissionsIndex.remind',
    defaultMessage: 'Send Reminder Emails',
  },
  includePhantoms: {
    id: 'course.assessment.submission.SubmissionsIndex.includePhantoms',
    defaultMessage: 'Include phantom users',
  },
  phantom: {
    id: 'course.assessment.submission.SubmissionsIndex.phantom',
    defaultMessage: 'Phantom User',
  },
  publishAutoFeedback: {
    id: 'course.assessment.submission.SubmissionsIndex.publishAutoFeedback',
    defaultMessage: 'Publish Automated Feedback ({count})',
  },
  unsubmitAllSubmissions: {
    id: 'course.assessment.submission.SubmissionsIndex.unsubmitAllSubmissions',
    defaultMessage: 'Unsubmit All Submissions',
  },
  unsubmitSubmission: {
    id: 'course.assessment.submission.SubmissionsIndex.unsubmitSubmission',
    defaultMessage: 'Unsubmit submission',
  },
  unsubmitConfirmation: {
    id: 'course.assessment.submission.SubmissionsIndex.unsubmitConfirmation',
    defaultMessage:
      'Are you sure you want to UNSUBMIT the submission for {name}? \
                    This will reset the submission time and permit the user to change \
                    their submission. NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
  deleteAllSubmissions: {
    id: 'course.assessment.submission.SubmissionsIndex.deleteAllSubmissions',
    defaultMessage: 'Delete All Submissions',
  },
  deleteSubmission: {
    id: 'course.assessment.submission.SubmissionsIndex.deleteSubmission',
    defaultMessage: 'Delete submission',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.SubmissionsIndex.deleteConfirmation',
    defaultMessage:
      'Are you sure you want to DELETE the submission for {name}? \
                    This will delete all attempts, past answers and submissions and the user \
                    will need to re-attempt all questions. NOTE THAT THIS ACTION IS IRREVERSIBLE!',
  },
});

export default translations;
