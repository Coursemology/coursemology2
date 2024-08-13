import { FC } from 'react';
import { Box } from '@mui/material';

import {
  questionTypes,
  workflowStates,
} from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { useAppSelector } from 'lib/hooks/store';

import LiveFeedbackButton from './button/LiveFeedbackButton';
import ResetProgrammingAnswerButton from './button/ResetProgrammingAnswerButton';
import RunCodeButton from './button/RunCodeButton';

interface Props {
  questionId: number;
}

const NonAutogradedProgrammingActionButtonsRow: FC<Props> = (props) => {
  const { questionId } = props;

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const { isCodaveriEnabled } = assessment;
  const { workflowState } = submission;

  const attempting = workflowState === workflowStates.Attempting;

  const question = questions[questionId];
  const { viewHistory } = question;

  return (
    !viewHistory &&
    attempting &&
    question.type === questionTypes.Programming && (
      <div className="flex flex-nowrap">
        <ResetProgrammingAnswerButton questionId={questionId} />
        {question.autogradable && <RunCodeButton questionId={questionId} />}
        <Box sx={{ flex: '1', width: '100%' }} />
        {isCodaveriEnabled &&
          question.isCodaveri &&
          question.liveFeedbackEnabled &&
          assessment.liveFeedbackEnabled && (
            <LiveFeedbackButton questionId={questionId} />
          )}
      </div>
    )
  );
};

export default NonAutogradedProgrammingActionButtonsRow;
