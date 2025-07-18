import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAssessmentSimilarity } from '../../operations/similarity';

import AssessmentSimilarityPage from './AssessmentSimilarityPage';

const translations = defineMessages({
  similarity: {
    id: 'course.assessment.similarity.similarity',
    defaultMessage: 'Similarity Results',
  },
});

const AssessmentSimilarity: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const fetchAssessmentSimilarityDetails = (): Promise<void> =>
    fetchAssessmentSimilarity(parsedAssessmentId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAssessmentSimilarityDetails}
    >
      {(): JSX.Element => <AssessmentSimilarityPage />}
    </Preload>
  );
};

const handle = translations.similarity;
export default Object.assign(AssessmentSimilarity, { handle });
