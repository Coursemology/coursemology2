import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import Hotkeys from 'react-hot-keys';
import { Button, Tooltip } from '@mui/material';

import { submitAnswer } from 'course/assessment/submission/actions/answers';
import { questionTypes } from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { ANSWER_TOO_LARGE_ERR } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast/toast';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const SubmitButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { questionId } = props;

  const assessment = useAppSelector(getAssessment);
  const questions = useAppSelector(getQuestions);
  const submission = useAppSelector(getSubmission);
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { resetField, getValues } = useFormContext();

  const question = questions[questionId];

  const { answerId, autogradable, type, attemptsLeft, attemptLimit } = question;
  const { isAutograding, isResetting } = questionFlags[questionId] || {};
  const { graderView } = submission;
  const { showMcqAnswer, autograded } = assessment;
  const { isSaving } = submissionFlags;

  const shouldRender =
    (!autograded && type === questionTypes.Programming && autogradable) ||
    (autograded &&
      (showMcqAnswer ||
        !autogradable ||
        ![
          questionTypes.MultipleChoice,
          questionTypes.MultipleResponse,
        ].includes(type)));

  const isDisabled =
    isAutograding ||
    isResetting ||
    isSaving ||
    (!autograded && !graderView && attemptsLeft === 0 && attemptLimit !== 0);

  const isAttemptsLimited =
    !autograded &&
    typeof attemptLimit === 'number' &&
    attemptLimit > 0 &&
    typeof attemptsLeft === 'number';

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
    shouldRender && (
      <>
        <Hotkeys
          disabled={isDisabled}
          filter={() => true}
          keyName="command+enter,control+enter"
          onKeyDown={() => onSubmitAnswer()}
        />
        <Tooltip title={t(translations.submitTooltip)}>
          <Button
            className="mb-2 mr-2"
            color="secondary"
            data-testid="SubmitButton"
            disabled={isDisabled}
            endIcon={isAutograding && <LoadingIndicator bare size={20} />}
            onClick={() => onSubmitAnswer()}
            variant="contained"
          >
            {autogradable && !isAttemptsLimited && t(translations.checkAnswer)}
            {autogradable &&
              isAttemptsLimited &&
              t(translations.checkAnswerWithLimit, { attemptsLeft })}
            {!autogradable && !isAttemptsLimited && t(translations.submit)}
            {!autogradable &&
              isAttemptsLimited &&
              t(translations.submitWithLimit, { attemptsLeft })}
          </Button>
        </Tooltip>
      </>
    )
  );
};

export default SubmitButton;
