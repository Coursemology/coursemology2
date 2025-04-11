import { Dispatch, FC, MutableRefObject, SetStateAction } from 'react';
import { Paper } from '@mui/material';

import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { HistoryViewData } from 'course/assessment/submission/types';
import { useAppSelector } from 'lib/hooks/store';

import QuestionContent from './QuestionContent';

interface Props {
  setHistoryInfo: Dispatch<SetStateAction<HistoryViewData>>;
  stepIndex: number;
  scrollToRef: MutableRefObject<null>;
}

const SinglePageQuestions: FC<Props> = (props) => {
  const { stepIndex, scrollToRef, setHistoryInfo } = props;

  const assessment = useAppSelector(getAssessment);
  const { questionIds } = assessment;

  const openAnswerHistoryView = (
    questionId: number,
    questionNumber: number,
  ): void => {
    setHistoryInfo({
      open: true,
      questionId,
      questionNumber,
    });
  };

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
            <QuestionContent
              handleNext={() => {}}
              openAnswerHistoryView={openAnswerHistoryView}
              stepIndex={index}
            />
          </Paper>
        ))}
      </>
    )
  );
};

export default SinglePageQuestions;
