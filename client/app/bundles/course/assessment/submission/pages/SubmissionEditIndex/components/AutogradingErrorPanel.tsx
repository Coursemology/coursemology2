import { FC } from 'react';

import EvaluatorErrorPanel from 'course/assessment/submission/components/EvaluatorErrorPanel';
import { questionTypes } from 'course/assessment/submission/constants';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import translations from 'course/assessment/submission/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const AutogradingErrorPanel: FC<Props> = (props) => {
  const { questionId } = props;

  const { t } = useTranslation();

  const questions = useAppSelector(getQuestions);
  const questionFlags = useAppSelector(getQuestionFlags);

  const { isCodaveri, type } = questions[questionId];
  const { jobError, jobErrorMessage } = questionFlags[questionId] || {};

  return (
    type === questionTypes.Programming &&
    jobError && (
      <EvaluatorErrorPanel className="mb-8">
        {isCodaveri
          ? t(translations.codaveriAutogradeFailure)
          : jobErrorMessage || ''}
      </EvaluatorErrorPanel>
    )
  );
};

export default AutogradingErrorPanel;
