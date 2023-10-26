import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { ProgrammingEvaluator } from 'types/course/admin/codaveri';

import { updateAllProgrammingQuestionCodaveriSettings } from 'course/admin/reducers/codaveriSettings';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateEvaluatorForAllQuestions } from '../operations';
import { getAllProgrammingQuestions } from '../selectors';
import translations from '../translations';

const CodaveriEnableDisableButtons: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const programmingQuestions = useAppSelector((state) =>
    getAllProgrammingQuestions(state),
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const qnsWithDefaultEval = programmingQuestions.filter(
    (question) => !question.isCodaveri,
  );
  const qnsWithCodaveriEval = programmingQuestions.filter(
    (question) => question.isCodaveri,
  );

  const handleEvaluatorUpdate = (evaluator: ProgrammingEvaluator): void => {
    setIsUpdating(true);
    updateEvaluatorForAllQuestions(evaluator)
      .then(() => {
        dispatch(updateAllProgrammingQuestionCodaveriSettings({ evaluator }));
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
    <div className="flex space-x-2">
      <Button
        disabled={
          qnsWithDefaultEval.length === programmingQuestions.length ||
          isUpdating
        }
        onClick={(): void => handleEvaluatorUpdate('default')}
        size="small"
        variant="contained"
      >
        {t(translations.disableAllCodaveri)}
      </Button>
      <Button
        disabled={
          qnsWithCodaveriEval.length === programmingQuestions.length ||
          isUpdating
        }
        onClick={(): void => handleEvaluatorUpdate('codaveri')}
        size="small"
        variant="contained"
      >
        {t(translations.enableAllCodaveri)}
      </Button>
    </div>
  );
};

export default CodaveriEnableDisableButtons;
