import { defineMessages } from 'react-intl';

const translations = defineMessages({
  header: {
    id: 'lib.components.getHelp.header',
    defaultMessage:
      'Recent Get Help Activity ({total, plural, one {# Conversation} other {# Conversations}})',
  },
  filterCourseLabel: {
    id: 'lib.components.getHelp.filter.filterCourseLabel',
    defaultMessage: 'Filter by Course',
  },
  filterAssessmentLabel: {
    id: 'lib.components.getHelp.filter.filterAssessmentLabel',
    defaultMessage: 'Filter by Assessment',
  },
  filterStudentLabel: {
    id: 'lib.components.getHelp.filter.filterStudentLabel',
    defaultMessage: 'Filter by Student',
  },
  filterStartDateLabel: {
    id: 'lib.components.getHelp.filter.filterStartDateLabel',
    defaultMessage: 'Start Date',
  },
  filterEndDateLabel: {
    id: 'lib.components.getHelp.filter.filterEndDateLabel',
    defaultMessage: 'End Date',
  },
  lastSevenDays: {
    id: 'lib.components.getHelp.filter.lastSevenDays',
    defaultMessage: 'Last 7 Days',
  },
  lastFourteenDays: {
    id: 'lib.components.getHelp.filter.lastFourteenDays',
    defaultMessage: 'Last 14 Days',
  },
  lastThirtyDays: {
    id: 'lib.components.getHelp.filter.lastThirtyDays',
    defaultMessage: 'Last 30 Days',
  },
  lastSixMonths: {
    id: 'lib.components.getHelp.filter.lastSixMonths',
    defaultMessage: 'Last 6 Months',
  },
  lastTwelveMonths: {
    id: 'lib.components.getHelp.filter.lastTwelveMonths',
    defaultMessage: 'Last 12 Months',
  },
  studentName: {
    id: 'lib.components.getHelp.table.studentName',
    defaultMessage: 'Name',
  },
  messageCount: {
    id: 'lib.components.getHelp.table.messageCount',
    defaultMessage: '# Msgs',
  },
  lastMessage: {
    id: 'lib.components.getHelp.table.lastMessage',
    defaultMessage: 'Last Message',
  },
  questionNumber: {
    id: 'lib.components.getHelp.table.questionNumber',
    defaultMessage: 'Question',
  },
  assessmentTitle: {
    id: 'lib.components.getHelp.table.assessmentTitle',
    defaultMessage: 'Assessment',
  },
  createdAt: {
    id: 'lib.components.getHelp.table.createdAt',
    defaultMessage: 'Last Message At',
  },
  courseTitle: {
    id: 'lib.components.getHelp.table.courseTitle',
    defaultMessage: 'Course',
  },
  instanceTitle: {
    id: 'lib.components.getHelp.table.instanceTitle',
    defaultMessage: 'Instance',
  },
  invalidDateSelection: {
    id: 'lib.components.getHelp.validation.invalidDateSelection',
    defaultMessage: 'End Date must be after or equal to Start Date',
  },
  exceedDateRange: {
    id: 'lib.components.getHelp.validation.exceedDateRange',
    defaultMessage: 'Date range cannot exceed 365 days',
  },
});

export default translations;
