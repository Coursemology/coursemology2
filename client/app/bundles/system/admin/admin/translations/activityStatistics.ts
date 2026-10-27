import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'system.admin.admin.ActivityStatistics.header',
    defaultMessage: 'Student Activity',
  },
  fetchFailure: {
    id: 'system.admin.admin.ActivityStatistics.fetchFailure',
    defaultMessage: 'Failed to load activity statistics.',
  },
  monthly: {
    id: 'system.admin.admin.ActivityStatistics.monthly',
    defaultMessage: 'Monthly',
  },
  yearly: {
    id: 'system.admin.admin.ActivityStatistics.yearly',
    defaultMessage: 'Yearly',
  },
  granularity: {
    id: 'system.admin.admin.ActivityStatistics.granularity',
    defaultMessage: 'Granularity',
  },
  previousPeriod: {
    id: 'system.admin.admin.ActivityStatistics.previousPeriod',
    defaultMessage: 'Previous period',
  },
  nextPeriod: {
    id: 'system.admin.admin.ActivityStatistics.nextPeriod',
    defaultMessage: 'Next period',
  },
  overall: {
    id: 'system.admin.admin.ActivityStatistics.overall',
    defaultMessage: 'Overall',
  },
  averagePerMonth: {
    id: 'system.admin.admin.ActivityStatistics.averagePerMonth',
    defaultMessage: 'Average per month',
  },
  averagePerYear: {
    id: 'system.admin.admin.ActivityStatistics.averagePerYear',
    defaultMessage: 'Average per year',
  },
  peak: {
    id: 'system.admin.admin.ActivityStatistics.peak',
    defaultMessage: 'Peak',
  },
  peakValue: {
    id: 'system.admin.admin.ActivityStatistics.peakValue',
    defaultMessage: '{count} in {bucket}',
  },
  studentCount: {
    id: 'system.admin.admin.ActivityStatistics.studentCount',
    defaultMessage: '{count, plural, one {# student} other {# students}}',
  },
  currentLabel: {
    id: 'system.admin.admin.ActivityStatistics.currentLabel',
    defaultMessage: '{label} (current)',
  },
  currentMonth: {
    id: 'system.admin.admin.ActivityStatistics.currentMonth',
    defaultMessage: 'Current month',
  },
  currentYear: {
    id: 'system.admin.admin.ActivityStatistics.currentYear',
    defaultMessage: 'Current year',
  },
  activeStudents: {
    id: 'system.admin.admin.ActivityStatistics.activeStudents',
    defaultMessage: 'Active students',
  },
  chartSummary: {
    id: 'system.admin.admin.ActivityStatistics.chartSummary',
    defaultMessage: 'Active students for {name}: {values}',
  },
  searchInstances: {
    id: 'system.admin.admin.ActivityStatistics.searchInstances',
    defaultMessage: 'Search instances',
  },
  csvFileName: {
    id: 'system.admin.admin.ActivityStatistics.csvFileName',
    defaultMessage: 'Student activity {period}',
  },
});
