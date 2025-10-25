import { Alert, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';

const AIGradingPlaygroundAlert = (props: {
  courseId: string;
  assessmentId: string;
  questionId: number;
}): JSX.Element => (
  <Alert className="w-full" severity="info">
    <Typography variant="body1">
      Try our
      <Link
        className="px-2"
        to={`/courses/${props.courseId}/assessments/${props.assessmentId}/question/${props.questionId}/rubric_playground`}
      >
        AI grading playground
      </Link>
      to generate more accurate results.
    </Typography>
  </Alert>
);

export default AIGradingPlaygroundAlert;
