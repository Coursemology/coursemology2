import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';

const AIGradingPlaygroundAlert: FC<{
  questionId: number;
  className?: string;
  answerId?: number;
}> = (props) => {
  const { courseId, assessmentId } = useParams();

  return (
    <Alert className={props.className} severity="info">
      <Typography variant="body2">
        Try our
        <Link
          className="px-2"
          opensInNewTab
          to={`/courses/${courseId}/assessments/${assessmentId}/question/${props.questionId}/rubric_playground${props.answerId ? `?source_answer_id=${props.answerId}` : ''}`}
        >
          AI grading playground
        </Link>
        to generate more accurate results.
      </Typography>
    </Alert>
  );
};

export default AIGradingPlaygroundAlert;
