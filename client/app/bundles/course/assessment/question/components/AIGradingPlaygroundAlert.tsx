import { Alert, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';

const AIGradingPlaygroundAlert = (props: {
  courseId: string;
  questionId: number;
}): JSX.Element => (
  <Alert className="w-full" severity="info">
    <Typography variant="body1">
      Try our
      <Link
        to={`/courses/${props.courseId}/rubrics/playground?source_question_id=${props.questionId}`}
      >
        AI grading playground
      </Link>
      to generate more accurate results.
    </Typography>
  </Alert>
);

export default AIGradingPlaygroundAlert;
