import { defineMessages } from 'react-intl';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchAssessments } from '../../operations';

import AssessmentsSimilarityTable from './assessments/AssessmentsSimilarityTable';

const translations = defineMessages({
  similarity: {
    id: 'course.similarity.SimilarityIndex.header.similarity',
    defaultMessage: 'Similarity Check',
  },
});

const SimilarityIndex = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Preload
      render={<LoadingIndicator />}
      while={async () => {
        await dispatch(fetchAssessments());
      }}
    >
      <Page title={t(translations.similarity)}>
        <AssessmentsSimilarityTable />
      </Page>
    </Preload>
  );
};

const handle = translations.similarity;

export default Object.assign(SimilarityIndex, { handle });
