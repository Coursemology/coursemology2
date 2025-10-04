import { useSearchParams } from 'react-router-dom';

import { fetchQuestionRubrics } from 'course/assessment/operations/questions';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import RubricHeader from './RubricHeader';

const RubricPlaygroundPage = (): JSX.Element => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const questionId = parseInt(searchParams.get('source_question_id') ?? '', 10);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={() => fetchQuestionRubrics(questionId)}
    >
      {({ rubrics }) => <RubricHeader rubrics={rubrics} />}
    </Preload>
  );
};

const handle = 'Rubric Playground';

export default Object.assign(RubricPlaygroundPage, { handle });
