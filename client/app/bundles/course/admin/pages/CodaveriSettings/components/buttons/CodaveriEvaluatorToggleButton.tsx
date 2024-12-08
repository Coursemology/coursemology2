import { FC, useState } from 'react';
import { Switch } from '@mui/material';
import {
  ProgrammingEvaluator,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

import { updateProgrammingQuestionCodaveriSettingsForAssessments } from 'course/admin/reducers/codaveriSettings';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateEvaluatorForAllQuestions } from '../../operations';
import translations from '../../translations';
import CodaveriSettingsChip from '../CodaveriSettingsChip';

interface CodaveriEvaluatorToggleButtonProps {
  programmingQuestions: ProgrammingQuestion[];
  for?: string;
  type: 'course' | 'category' | 'tab' | 'assessment' | 'question';
}

const CodaveriEvaluatorToggleButton: FC<CodaveriEvaluatorToggleButtonProps> = (
  props,
) => {
  const { programmingQuestions, for: title, type } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [isEvaluatorUpdating, setIsEvaluatorUpdating] = useState(false);
  const [evaluatorSettingsConfirmation, setEvaluatorSettingsConfirmation] =
    useState(false);
  const [isEvaluatorChecked, setEvaluatorChecked] = useState(false);

  const programmingQuestionIds = programmingQuestions.map((qn) => qn.id);

  const qnsWithCodaveriEval = programmingQuestions.filter(
    (question) => question.isCodaveri,
  );

  const hasNoProgrammingQuestions = programmingQuestions.length === 0;

  const handleEvaluatorUpdate = (evaluator: ProgrammingEvaluator): void => {
    setIsEvaluatorUpdating(true);
    updateEvaluatorForAllQuestions(programmingQuestionIds, evaluator)
      .then(() => {
        dispatch(
          updateProgrammingQuestionCodaveriSettingsForAssessments({
            evaluator,
            programmingQuestionIds,
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

  const updateEvaluator = (isChecked: boolean): void => {
    if (type === 'question') {
      handleEvaluatorUpdate(isChecked ? 'codaveri' : 'default');
    } else {
      setEvaluatorSettingsConfirmation(true);
    }
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
            updateEvaluator(isChecked);
          }}
        />
        <CodaveriSettingsChip
          for="codaveri_evaluator"
          questions={programmingQuestions}
        />
      </div>

      <Prompt
        disabled={isEvaluatorUpdating}
        onClickPrimary={() => {
          return handleEvaluatorUpdate(
            isEvaluatorChecked ? 'codaveri' : 'default',
          );
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
