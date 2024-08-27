import { FC, useState } from 'react';
import { Switch } from '@mui/material';
import { ProgrammingEvaluator } from 'types/course/admin/codaveri';

import {
  updateProgrammingQuestionCodaveriSettingsForAssessments,
  updateProgrammingQuestionLiveFeedbackEnabledForAssessments,
} from 'course/admin/reducers/codaveriSettings';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  updateEvaluatorForAllQuestions,
  updateLiveFeedbackEnabledForAllQuestions,
} from '../../operations';
import { getProgrammingQuestionsForAssessments } from '../../selectors';
import translations from '../../translations';
import CodaveriSettingsChip from '../CodaveriSettingsChip';

interface CodaveriEnableDisableButtonsProps {
  assessmentIds: number[];
}

const CodaveriToggleButtons: FC<CodaveriEnableDisableButtonsProps> = (
  props,
) => {
  const { assessmentIds } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const programmingQuestions = useAppSelector((state) =>
    getProgrammingQuestionsForAssessments(state, assessmentIds),
  );

  const [isEvaluatorUpdating, setIsEvaluatorUpdating] = useState(false);
  const [isLiveFeedbackUpdating, setIsLiveFeedbackUpdating] = useState(false);

  const qnsWithCodaveriEval = programmingQuestions.filter(
    (question) => question.isCodaveri,
  );
  const qnsWithLiveFeedbackEnabled = programmingQuestions.filter(
    (question) => question.liveFeedbackEnabled,
  );

  const hasNoProgrammingQuestions = programmingQuestions.length === 0;

  const handleEvaluatorUpdate = (evaluator: ProgrammingEvaluator): void => {
    setIsEvaluatorUpdating(true);
    updateEvaluatorForAllQuestions(assessmentIds, evaluator)
      .then(() => {
        dispatch(
          updateProgrammingQuestionCodaveriSettingsForAssessments({
            evaluator,
            assessmentIds,
          }),
        );
        toast.success(
          t(translations.succesfulUpdateAllEvaluator, { evaluator }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.errorOccurredWhenUpdatingCodaveriEvaluatorSettings),
        );
      })
      .finally(() => setIsEvaluatorUpdating(false));
  };

  const handleLiveFeedbackUpdate = (liveFeedbackEnabled: boolean): void => {
    setIsLiveFeedbackUpdating(true);
    updateLiveFeedbackEnabledForAllQuestions(assessmentIds, liveFeedbackEnabled)
      .then(() => {
        dispatch(
          updateProgrammingQuestionLiveFeedbackEnabledForAssessments({
            liveFeedbackEnabled,
            assessmentIds,
          }),
        );
        toast.success(
          t(translations.successfulUpdateAllLiveFeedbackEnabled, {
            liveFeedbackEnabled,
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.errorOccurredWhenUpdatingLiveFeedbackSettings),
        );
      })
      .finally(() => setIsLiveFeedbackUpdating(false));
  };

  return (
    <div className="pr-7 space-x-8 flex justify-between">
      <div>
        <Switch
          checked={
            hasNoProgrammingQuestions
              ? false
              : qnsWithCodaveriEval.length === programmingQuestions.length
          }
          color="primary"
          disabled={hasNoProgrammingQuestions || isEvaluatorUpdating}
          onChange={(_, isChecked): void => {
            return isChecked
              ? handleEvaluatorUpdate('codaveri')
              : handleEvaluatorUpdate('default');
          }}
        />
        <CodaveriSettingsChip
          assessmentIds={assessmentIds}
          for="codaveri_evaluator"
        />
      </div>

      <div>
        <Switch
          checked={
            hasNoProgrammingQuestions
              ? false
              : qnsWithLiveFeedbackEnabled.length ===
                programmingQuestions.length
          }
          color="primary"
          disabled={hasNoProgrammingQuestions || isLiveFeedbackUpdating}
          onChange={(_, isChecked): void => handleLiveFeedbackUpdate(isChecked)}
        />
        <CodaveriSettingsChip
          assessmentIds={assessmentIds}
          for="live_feedback"
        />
      </div>
    </div>
  );
};

export default CodaveriToggleButtons;
