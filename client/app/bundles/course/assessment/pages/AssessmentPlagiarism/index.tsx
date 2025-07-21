import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAssessmentPlagiarism } from '../../operations/plagiarism';

import AssessmentPlagiarismPage from './AssessmentPlagiarismPage';

const translations = defineMessages({
  plagiarism: {
    id: 'course.assessment.plagiarism.plagiarism',
    defaultMessage: 'Plagiarism Results',
  },
});

const AssessmentPlagiarism: FC = () => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const fetchAssessmentPlagiarismDetails = (): Promise<void> =>
    fetchAssessmentPlagiarism(parsedAssessmentId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAssessmentPlagiarismDetails}
    >
      {(): JSX.Element => <AssessmentPlagiarismPage />}
    </Preload>
  );
};

const handle = translations.plagiarism;
export default Object.assign(AssessmentPlagiarism, { handle });
