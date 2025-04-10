import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@mui/material';

import { submitAnswer } from 'course/assessment/submission/actions/answers';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { ANSWER_TOO_LARGE_ERR } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const RunCodeButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { questionId } = props;

  const questions = useAppSelector(getQuestions);
  const submission = useAppSelector(getSubmission);
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { resetField, getValues } = useFormContext();

  const question = questions[questionId];

  const { answerId, attemptsLeft, attemptLimit } = question;
  const { isAutograding, isResetting } = questionFlags[questionId] || {};
  const { graderView } = submission;
  const { isSaving } = submissionFlags;

  const onSubmitAnswer = (): void => {
    dispatch(
      submitAnswer(question.id, answerId, getValues(`${answerId}`), resetField),
    ).catch((error) => {
      if (error?.message?.includes(ANSWER_TOO_LARGE_ERR)) {
        toast.error(t(translations.answerTooLargeError));
      }
    });
  };

  return (
    <Button
      className="mb-2 mr-2"
      color="secondary"
      disabled={
        isAutograding ||
        isResetting ||
        isSaving ||
        (!graderView && attemptsLeft === 0)
      }
      endIcon={isAutograding && <LoadingIndicator bare size={20} />}
      id="run-code"
      onClick={() => onSubmitAnswer()}
      variant="contained"
    >
      {attemptLimit
        ? t(translations.runCodeWithLimit, { attemptsLeft: attemptsLeft ?? '' })
        : t(translations.runCode)}
    </Button>
  );
};

export default RunCodeButton;
