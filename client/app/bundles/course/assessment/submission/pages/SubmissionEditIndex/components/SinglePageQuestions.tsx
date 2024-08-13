import { FC, MutableRefObject } from 'react';
import { Paper } from '@mui/material';

import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { useAppSelector } from 'lib/hooks/store';

import QuestionContent from './QuestionContent';

interface Props {
  stepIndex: number;
  scrollToRef: MutableRefObject<null>;
}

const SinglePageQuestions: FC<Props> = (props) => {
  const { stepIndex, scrollToRef } = props;

  const assessment = useAppSelector(getAssessment);
  const { questionIds } = assessment;

  return (
    questionIds &&
    questionIds.length > 0 && (
      <>
        {questionIds.map((id, index) => (
          <Paper
            key={id}
            ref={stepIndex === index ? scrollToRef : undefined}
            className="mb-5 p-6"
            variant="outlined"
          >
            <QuestionContent handleNext={() => {}} stepIndex={index} />
          </Paper>
        ))}
      </>
    )
  );
};

export default SinglePageQuestions;
