import { FC, useState } from 'react';
import { Switch } from '@mui/material';
import { ProgrammingEvaluator } from 'types/course/admin/codaveri';

import { updateProgrammingQuestionCodaveriSettingsForAssessments } from 'course/admin/reducers/codaveriSettings';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateEvaluatorForAllQuestions } from '../../operations';
import { getProgrammingQuestionsForAssessments } from '../../selectors';
import translations from '../../translations';
import CodaveriSettingsChip from '../CodaveriSettingsChip';

interface CodaveriEvaluatorToggleButtonProps {
  assessmentIds: number[];
  for: string;
  type: 'course' | 'category' | 'tab' | 'assessment';
}

const CodaveriEvaluatorToggleButton: FC<CodaveriEvaluatorToggleButtonProps> = (
  props,
) => {
  const { assessmentIds, for: title, type } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const programmingQuestions = useAppSelector((state) =>
    getProgrammingQuestionsForAssessments(state, assessmentIds),
  );

  const [isEvaluatorUpdating, setIsEvaluatorUpdating] = useState(false);
  const [evaluatorSettingsConfirmation, setEvaluatorSettingsConfirmation] =
    useState(false);
  const [isEvaluatorChecked, setEvaluatorChecked] = useState(false);

  const qnsWithCodaveriEval = programmingQuestions.filter(
    (question) => question.isCodaveri,
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
      .finally(() => {
        setEvaluatorSettingsConfirmation(false);
        setIsEvaluatorUpdating(false);
      });
  };

  return (
    <div>
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
            setEvaluatorChecked(isChecked);
            setEvaluatorSettingsConfirmation(true);
          }}
        />
        <CodaveriSettingsChip
          assessmentIds={assessmentIds}
          for="codaveri_evaluator"
        />
      </div>

      <Prompt
        disabled={isEvaluatorUpdating}
        onClickPrimary={() => {
          return isEvaluatorChecked
            ? handleEvaluatorUpdate('codaveri')
            : handleEvaluatorUpdate('default');
        }}
        onClose={() => setEvaluatorSettingsConfirmation(false)}
        open={evaluatorSettingsConfirmation}
        primaryColor="info"
        primaryLabel={t(translations.enableDisableButton, {
          enabled: isEvaluatorChecked,
        })}
        title={t(translations.enableDisableEvaluator, {
          enabled: isEvaluatorChecked,
          title: title ?? '',
          questionCount: programmingQuestions.length,
        })}
      >
        <PromptText>
          {t(translations.enableDisableEvaluatorDescription, {
            enabled: isEvaluatorChecked,
            type: type ?? 'course',
            questionCount: programmingQuestions.length,
          })}
        </PromptText>
      </Prompt>
    </div>
  );
};

export default CodaveriEvaluatorToggleButton;
