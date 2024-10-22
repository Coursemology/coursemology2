import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import Hotkeys from 'react-hot-keys';
import { FormattedMessage } from 'react-intl';
import { Button, Tooltip } from '@mui/material';

import { submitAnswer } from 'course/assessment/submission/actions/answers';
import { questionTypes } from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
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
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { resetField, getValues } = useFormContext();

  const question = questions[questionId];

  const { answerId, autogradable, type } = question;
  const { isAutograding, isResetting } = questionFlags[questionId] || {};
  const { showMcqAnswer } = assessment;
  const { isSaving } = submissionFlags;

  const shouldRender =
    showMcqAnswer ||
    !autogradable ||
    ![questionTypes.MultipleChoice, questionTypes.MultipleResponse].includes(
      type,
    );

  const onSubmitAnswer = (): void => {
    dispatch(
      submitAnswer(question.id, answerId, getValues(`${answerId}`), resetField),
    );
  };

  return (
    shouldRender && (
      <>
        <Hotkeys
          disabled={isAutograding || isResetting || isSaving}
          filter={() => true}
          keyName="command+enter,control+enter"
          onKeyDown={() => onSubmitAnswer()}
        />
        <Tooltip title={<FormattedMessage {...translations.submitTooltip} />}>
          <Button
            className="mb-2 mr-2"
            color="secondary"
            disabled={isAutograding || isResetting || isSaving}
            endIcon={isAutograding && <LoadingIndicator bare size={20} />}
            onClick={() => onSubmitAnswer()}
            variant="contained"
          >
            {t(translations.submit)}
          </Button>
        </Tooltip>
      </>
    )
  );
};

export default SubmitButton;
