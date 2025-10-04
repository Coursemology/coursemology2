import { fetchQuestionRubrics } from './operations/rubric';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import RubricHeader from './RubricHeader';

const RubricPlaygroundPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Preload render={<LoadingIndicator />} while={() => fetchQuestionRubrics()}>
      {(rubrics) => <RubricHeader rubrics={rubrics} />}
    </Preload>
  );
};

const handle = 'Rubric Playground';

export default Object.assign(RubricPlaygroundPage, { handle });
