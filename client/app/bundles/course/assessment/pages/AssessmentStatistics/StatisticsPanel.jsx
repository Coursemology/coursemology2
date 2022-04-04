import { Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
    gutterBottom
    variant="h6"
    component="div"
    fontWeight="bold"
    marginBottom="1rem"
  >
    {children}
  </Typography>
);

CardTitle.propTypes = {
  children: PropTypes.element.isRequired,
};

const StatisticsPanel = ({ submissions, allStudents, intl }) => (
  <div className="assessment-statistics-panel">
    <div className="assessment-statistics-panel__top">
      <Card
        className="assessment-statistics-panel__top-left"
        variant="outlined"
      >
        <CardContent>
          <CardTitle>
            {intl.formatMessage(translations.submissionStatuses)}
          </CardTitle>
          <SubmissionDoughnut
            submissions={submissions}
            allStudents={allStudents}
          />
        </CardContent>
      </Card>
      <Card
        className="assessment-statistics-panel__top-right"
        variant="outlined"
      >
        <CardContent>
          <CardTitle>
            {intl.formatMessage(translations.gradeDistribution)}
          </CardTitle>
          <GradeViolinChart submissions={submissions} />
        </CardContent>
      </Card>
    </div>
    <Card className="assessment-statistics-panel__bottom" variant="outlined">
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
  intl: intlShape.isRequired,
};

export default injectIntl(StatisticsPanel);
