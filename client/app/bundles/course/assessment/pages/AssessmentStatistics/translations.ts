import { defineMessages } from 'react-intl';

const translations = defineMessages({
  answers: {
    id: 'course.assessment.statistics.answers',
    defaultMessage: 'Answers',
  },
  attemptsFilename: {
    id: 'course.assessment.statistics.attempts.filename',
    defaultMessage: 'Question-level Attempt Statistics for {assessment}',
  },
  attemptsGreenCellLegend: {
    id: 'course.assessment.statistics.attempts.greenCellLegend',
    defaultMessage: 'Correct',
  },
  attemptsRedCellLegend: {
    id: 'course.assessment.statistics.attempts.redCellLegend',
    defaultMessage: 'Incorrect',
  },
  closePrompt: {
    id: 'course.assessment.statistics.closePrompt',
    defaultMessage: 'Close',
  },
  grader: {
    id: 'course.assessment.statistics.grader',
    defaultMessage: 'Grader',
  },
  grayCellLegend: {
    id: 'course.assessment.statistics.grayCellLegend',
    defaultMessage: 'Undecided (question is Non-autogradable)',
  },
  group: {
    id: 'course.assessment.statistics.group',
    defaultMessage: 'Group',
  },
  legendHigherusage: {
    id: 'course.assessment.statistics.legendHigherusage',
    defaultMessage: 'Higher Usage',
  },
  legendLowerUsage: {
    id: 'course.assessment.statistics.legendLowerUsage',
    defaultMessage: 'Lower Usage',
  },
  liveFeedbackFilename: {
    id: 'course.assessment.statistics.liveFeedback.filename',
    defaultMessage: 'Question-level Live Feedback Statistics for {assessment}',
  },
  liveFeedbackHistoryPromptTitle: {
    id: 'course.assessment.statistics.liveFeedbackHistoryPromptTitle',
    defaultMessage: 'Live Feedback History',
  },
  marksFilename: {
    id: 'course.assessment.statistics.marks.filename',
    defaultMessage: 'Question-level Marks Statistics for {assessment}',
  },
  marksGreenCellLegend: {
    id: 'course.assessment.statistics.marks.greenCellLegend',
    defaultMessage: '>= 0.5 * Maximum Grade',
  },
  marksRedCellLegend: {
    id: 'course.assessment.statistics.marks.redCellLegend',
    defaultMessage: '< 0.5 * Maximum Grade',
  },
  name: {
    id: 'course.assessment.statistics.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'course.assessment.statistics.email',
    defaultMessage: 'Email',
  },
  nameGroupsGraderSearchText: {
    id: 'course.assessment.statistics.nameGroupsGraderSearchText',
    defaultMessage: 'Search by Student Name, Group or Grader Name',
  },
  nameGroupsSearchText: {
    id: 'course.assessment.statistics.nameGroupsSearchText',
    defaultMessage: 'Search by Name or Groups',
  },
  noSubmission: {
    id: 'course.assessment.statistics.noSubmission',
    defaultMessage: 'No submission yet',
  },
  onlyForAutogradableAssessment: {
    id: 'course.assessment.statistics.onlyForAutogradableAssessment',
    defaultMessage:
      'This table is only displayed for Assessment with at least one Autograded Questions',
  },
  questionDisplayTitle: {
    id: 'course.assessment.statistics.questionDisplayTitle',
    defaultMessage: 'Q{index} for {student}',
  },
  questionIndex: {
    id: 'course.assessment.statistics.questionIndex',
    defaultMessage: 'Q{index}',
  },
  total: {
    id: 'course.assessment.statistics.total',
    defaultMessage: 'Total',
  },
  workflowState: {
    id: 'course.assessment.statistics.workflowState',
    defaultMessage: 'Status',
  },

  questionTitle: {
    id: 'course.assessment.liveFeedback.questionTitle',
    defaultMessage: 'Question {index}',
  },
  messageTimingTitle: {
    id: 'course.assessment.liveFeedback.messageTimingTitle',
    defaultMessage: 'Generated at: {usedAt}',
  },

  liveFeedbackName: {
    id: 'course.assessment.liveFeedback.comments',
    defaultMessage: 'Live Feedback',
  },
  comments: {
    id: 'course.assessment.liveFeedback.comments',
    defaultMessage: 'Comments',
  },
  lineHeader: {
    id: 'course.assessment.liveFeedback.lineHeader',
    defaultMessage: 'Line {lineNumber}',
  },
});

export default translations;
