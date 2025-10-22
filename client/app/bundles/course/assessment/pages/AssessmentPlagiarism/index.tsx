import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';

import {
  fetchAssessmentPlagiarism,
  INITIAL_SUBMISSION_PAIR_QUERY_SIZE,
} from '../../operations/plagiarism';
import { plagiarismActions } from '../../reducers/plagiarism';

import AssessmentPlagiarismPage from './AssessmentPlagiarismPage';

const translations = defineMessages({
  plagiarism: {
    id: 'course.assessment.plagiarism.plagiarism',
    defaultMessage: 'Plagiarism Results',
  },
});

const AssessmentPlagiarism: FC = () => {
  const { assessmentId } = useParams();
  const dispatch = useAppDispatch();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const fetchAssessmentPlagiarismDetails = async (): Promise<void> => {
    const plagiarismData = await fetchAssessmentPlagiarism(
      parsedAssessmentId,
      INITIAL_SUBMISSION_PAIR_QUERY_SIZE,
      0,
    );
    dispatch(plagiarismActions.initialize(plagiarismData));
  };

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
