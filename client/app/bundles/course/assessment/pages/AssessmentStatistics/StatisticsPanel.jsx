import { defineMessages, injectIntl } from 'react-intl';
import { Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { courseUserShape, submissionRecordsShape } from '../../propTypes';

import GradeViolinChart from './GradeViolinChart';
import SubmissionDoughnut from './SubmissionDoughnut';
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

const StatisticsPanel = ({ submissions, allStudents, intl }) => (
  <div className="full-w flex flex-col space-y-4">
    <div className="full-w flex flex-1 space-x-4 max-xl:flex-col max-xl:space-y-4">
      <Card className="flex-1" variant="outlined">
        <CardContent>
          <CardTitle>
            {intl.formatMessage(translations.submissionStatuses)}
          </CardTitle>
          <SubmissionDoughnut
            allStudents={allStudents}
            submissions={submissions}
          />
        </CardContent>
      </Card>
      <Card className="flex-auto" variant="outlined">
        <CardContent>
          <CardTitle>
            {intl.formatMessage(translations.gradeDistribution)}
          </CardTitle>
          <GradeViolinChart submissions={submissions} />
        </CardContent>
      </Card>
    </div>
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

StatisticsPanel.propTypes = {
  submissions: PropTypes.arrayOf(submissionRecordsShape).isRequired,
  allStudents: PropTypes.arrayOf(courseUserShape).isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(StatisticsPanel);
