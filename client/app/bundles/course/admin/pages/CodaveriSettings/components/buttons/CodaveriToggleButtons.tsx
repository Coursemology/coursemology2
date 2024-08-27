import { FC, useState } from 'react';
import { Switch } from '@mui/material';
import { ProgrammingEvaluator } from 'types/course/admin/codaveri';

import { updateProgrammingQuestionCodaveriSettingsForAssessments } from 'course/admin/reducers/codaveriSettings';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateEvaluatorForAllQuestions } from '../../operations';
import { getProgrammingQuestionsForAssessments } from '../../selectors';
import translations from '../../translations';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const qnsWithCodaveriEval = programmingQuestions.filter(
    (question) => question.isCodaveri,
  );

  const hasNoProgrammingQuestions = programmingQuestions.length === 0;

  const handleEvaluatorUpdate = (evaluator: ProgrammingEvaluator): void => {
    setIsUpdating(true);
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
        toast.error(t(translations.errorOccurredWhenUpdating));
      })
      .finally(() => setIsUpdating(false));
  };

  return (
    <div className="pr-6 flex justify-between">
      <Switch
        checked={
          hasNoProgrammingQuestions
            ? false
            : qnsWithCodaveriEval.length === programmingQuestions.length
        }
        color="primary"
        disabled={hasNoProgrammingQuestions || isUpdating}
        onChange={(_, isChecked): void => {
          return isChecked
            ? handleEvaluatorUpdate('codaveri')
            : handleEvaluatorUpdate('default');
        }}
      />
    </div>
  );
};

export default CodaveriToggleButtons;
