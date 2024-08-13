import { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  questionTypes,
  workflowStates,
} from 'course/assessment/submission/constants';
import Comments from 'course/assessment/submission/containers/Comments';
import QuestionGrade from 'course/assessment/submission/containers/QuestionGrade';
import TestCaseView from 'course/assessment/submission/containers/TestCaseView';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getHistoryQuestions } from 'course/assessment/submission/selectors/history';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { getTopics } from 'course/assessment/submission/selectors/topics';
import { useAppSelector } from 'lib/hooks/store';

import SubmissionAnswer from '../../../components/answers';
import { ErrorStruct } from '../validations/types';

import ReevaluateButton from './button/ReevaluateButton';
import AutogradedActionButtonsRow from './AutogradedActionButtonsRow';
import AutogradingErrorPanel from './AutogradingErrorPanel';
import ExplanationPanel from './ExplanationPanel';
import NonAutogradedProgrammingActionButtonsRow from './NonAutogradedProgrammingActionButtonsRow';

interface Props {
  handleNext: () => void;
  stepIndex: number;
}

const QuestionContent: FC<Props> = (props) => {
  const { handleNext, stepIndex } = props;

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const topics = useAppSelector(getTopics);
  const submissionFlags = useAppSelector(getSubmissionFlags);
  const historyQuestions = useAppSelector(getHistoryQuestions);

  const {
    formState: { errors },
  } = useFormContext();

  const { autograded, showMcqMrqSolution, questionIds } = assessment;
  const { workflowState, graderView } = submission;
  const { isSaving } = submissionFlags;

  const attempting = workflowState === workflowStates.Attempting;

  const questionId = questionIds[stepIndex];
  const question = questions[questionId];
  const { answerId, topicId, viewHistory, type } = question;
  const topic = topics[topicId];
  const submissionErrors = errors as unknown as ErrorStruct[];

  const isProgrammingQuestion = type === questionTypes.Programming;

  const allErrors = answerId
    ? submissionErrors[answerId]?.errorTypes ?? []
    : [];

  return (
    <>
      <SubmissionAnswer
        {...{
          readOnly: !attempting,
          answerId: answerId || null,
          allErrors,
          question,
          questionType: question.type,
          historyQuestions,
          graderView,
          showMcqMrqSolution,
        }}
      />
      {autograded ? (
        <AutogradedActionButtonsRow
          handleNext={handleNext}
          stepIndex={stepIndex}
        />
      ) : (
        <NonAutogradedProgrammingActionButtonsRow questionId={question.id} />
      )}
      {(autograded || (isProgrammingQuestion && !viewHistory)) && (
        <ExplanationPanel questionId={questionId} />
      )}
      {(autograded || !viewHistory) && (
        <AutogradingErrorPanel questionId={questionId} />
      )}
      <TestCaseView questionId={questionId} />
      {(autograded || !viewHistory) &&
        !attempting &&
        graderView &&
        isProgrammingQuestion && <ReevaluateButton questionId={questionId} />}
      {(autograded || !viewHistory) && (
        <QuestionGrade isSaving={isSaving} questionId={questionId} />
      )}
      <Comments topic={topic} />
    </>
  );
};

export default QuestionContent;
