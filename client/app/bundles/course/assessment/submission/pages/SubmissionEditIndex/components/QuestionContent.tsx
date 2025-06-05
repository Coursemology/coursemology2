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
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { getTopics } from 'course/assessment/submission/selectors/topics';
import { useAppSelector } from 'lib/hooks/store';

import SubmissionAnswer from '../../../components/answers';
import { ErrorStruct } from '../validations/types';

import AutogradedActionButtonsRow from './AutogradedActionButtonsRow';
import AutogradingErrorPanel from './AutogradingErrorPanel';
import ExplanationPanel from './ExplanationPanel';
import NonAutogradedProgrammingActionButtonsRow from './NonAutogradedProgrammingActionButtonsRow';

interface Props {
  handleNext: () => void;
  stepIndex: number;
  openAnswerHistoryView: (questionId: number, questionNumber: number) => void;
}

const QuestionContent: FC<Props> = (props) => {
  const { handleNext, stepIndex, openAnswerHistoryView } = props;

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const topics = useAppSelector(getTopics);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const {
    formState: { errors },
  } = useFormContext();

  const { autograded, showMcqMrqSolution, questionIds } = assessment;
  const { workflowState, graderView } = submission;
  const { isSaving } = submissionFlags;

  const attempting = workflowState === workflowStates.Attempting;

  const questionId = questionIds[stepIndex];
  const question = questions[questionId];
  const { answerId, topicId, type } = question;
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
          submissionId: submission.id,
          graderView,
          showMcqMrqSolution,
          openAnswerHistoryView,
          questionNumber: stepIndex + 1,
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
      {(autograded || isProgrammingQuestion) && (
        <ExplanationPanel questionId={questionId} />
      )}
      <AutogradingErrorPanel questionId={questionId} />
      {isProgrammingQuestion && <TestCaseView questionId={questionId} />}
      <QuestionGrade isSaving={isSaving} questionId={questionId} />
      <Comments topic={topic} />
    </>
  );
};

export default QuestionContent;
