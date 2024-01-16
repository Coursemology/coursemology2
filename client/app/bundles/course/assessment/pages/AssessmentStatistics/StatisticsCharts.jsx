import { defineMessages, injectIntl } from 'react-intl';
import { Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { courseUserShape, submissionRecordsShape } from '../../propTypes';

import GradeViolinChart from './GradeViolinChart';
import SubmissionStatusChart from './SubmissionStatusChart';
import SubmissionTimeAndGradeChart from './SubmissionTimeAndGradeChart';

const translations = defineMessages({
  submissionStatuses: {
    id: 'course.assessment.statistics.submissionStatuses',
    defaultMessage: 'Submission Statuses',
  },
  gradeDistribution: {
    id: 'course.assessment.statistics.gradeDistribution',
    defaultMessage: 'Grade Distribution',
  },
  submissionTimeAndGrade: {
    id: 'course.assessment.statistics.submissionTimeAndGrade',
    defaultMessage: 'Submission Time and Grade',
  },
});

const CardTitle = ({ children }) => (
  <Typography
    component="div"
    fontWeight="bold"
    gutterBottom
    marginBottom="1rem"
    variant="h6"
  >
    {children}
  </Typography>
);

CardTitle.propTypes = {
  children: PropTypes.element.isRequired,
};

const StatisticsCharts = ({ submissions, allStudents, intl }) => (
  <div className="full-w space-y-4">
    <Card variant="outlined">
      <CardContent>
        <CardTitle>
          {intl.formatMessage(translations.submissionStatuses)}
        </CardTitle>
        <SubmissionStatusChart
          numStudents={allStudents.length}
          submissions={submissions}
        />
      </CardContent>
    </Card>
    <Card variant="outlined">
      <CardContent>
        <CardTitle>
          {intl.formatMessage(translations.gradeDistribution)}
        </CardTitle>
        <GradeViolinChart submissions={submissions} />
      </CardContent>
    </Card>
    <Card variant="outlined">
      <CardContent>
        <CardTitle>
          {intl.formatMessage(translations.submissionTimeAndGrade)}
        </CardTitle>
        <SubmissionTimeAndGradeChart submissions={submissions} />
      </CardContent>
    </Card>
    {/* TODO: Add section on hardest questions */}
  </div>
);

StatisticsCharts.propTypes = {
  submissions: PropTypes.arrayOf(submissionRecordsShape).isRequired,
  allStudents: PropTypes.arrayOf(courseUserShape).isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(StatisticsCharts);
