import { useEffect } from 'react';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getScribingId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import assessmentsTranslations from '../../translations';

import translations from './ScribingQuestionForm/translations';
import { fetchScribingQuestion, fetchSkills } from './operations';
import ScribingQuestionForm from './ScribingQuestionForm';
import { buildInitialValues } from './utils';

const ScribingQuestion = (): JSX.Element => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const scribingQuestion = useAppSelector((state) => state.scribingQuestion);

  const initialValues = buildInitialValues(scribingQuestion);
  const scribingId = getScribingId();

  useEffect(() => {
    if (scribingId) {
      dispatch(fetchScribingQuestion(t(translations.fetchFailureMessage)));
    } else {
      dispatch(fetchSkills());
    }
  }, []);

  if (scribingQuestion.isLoading) return <LoadingIndicator />;

  return (
    <ScribingQuestionForm
      data={scribingQuestion}
      initialValues={initialValues}
      scribingId={scribingId}
    />
  );
};

const handle = assessmentsTranslations.newScribing;

export default Object.assign(ScribingQuestion, { handle });
