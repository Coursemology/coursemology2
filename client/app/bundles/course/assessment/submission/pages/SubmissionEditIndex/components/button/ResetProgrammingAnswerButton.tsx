import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@mui/material';

import { resetAnswer } from 'course/assessment/submission/actions/answers';
import { questionTypes } from 'course/assessment/submission/constants';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import translations from 'course/assessment/submission/translations';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const ResetProgrammingAnswerButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { questionId } = props;
  const submissionId = getSubmissionId();

  const questions = useAppSelector(getQuestions);
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [resetAnswerId, setResetAnswerId] = useState<number | null>(null);

  const question = questions[questionId];

  const { answerId } = question;
  const { isAutograding, isResetting } = questionFlags[questionId] || {};
  const { isSaving } = submissionFlags;

  const { resetField } = useFormContext();

  const onReset = (): void => {
    dispatch(resetAnswer(submissionId, resetAnswerId, questionId, resetField));
  };

  return (
    question.type === questionTypes.Programming && (
      <>
        <Button
          className="mb-2 mr-2"
          disabled={isAutograding || isResetting || isSaving}
          onClick={() => {
            setResetConfirmation(true);
            setResetAnswerId(answerId!);
          }}
          variant="contained"
        >
          {t(translations.reset)}
        </Button>
        <ConfirmationDialog
          message={t(translations.resetConfirmation)}
          onCancel={() => {
            setResetConfirmation(false);
            setResetAnswerId(null);
          }}
          onConfirm={() => {
            setResetConfirmation(false);
            setResetAnswerId(null);
            onReset();
          }}
          open={resetConfirmation}
        />
      </>
    )
  );
};

export default ResetProgrammingAnswerButton;
