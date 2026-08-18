import { useParams } from 'react-router-dom';
import {
  FetchAssessmentData,
  isBlockedByMonitorAssessmentData,
  isUnauthenticatedAssessmentData,
} from 'types/course/assessment/assessments';

import { redirectToNotFoundIfMissing } from 'api/ErrorHandling';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAssessment } from '../../operations/assessments';
import AssessmentAuthenticate from '../AssessmentAuthenticate';
import AssessmentBlockedByMonitorPage from '../AssessmentBlockedByMonitorPage';

import AssessmentShowPage from './AssessmentShowPage';

const AssessmentShow = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id) throw new Error(`AssessmentShow was loaded with ID: ${id}.`);

  const fetchAssessmentWithId = async (): Promise<FetchAssessmentData> => {
    try {
      return await fetchAssessment(id);
    } catch (error) {
      // An ID that matches no assessment in this course 404s from the backend. Show the
      // not-found page rather than `Preload`'s generic fetching error.
      redirectToNotFoundIfMissing(error);
      throw error;
    }
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAssessmentWithId}>
      {(data): JSX.Element => {
        if (isUnauthenticatedAssessmentData(data))
          return <AssessmentAuthenticate for={data} />;

        if (isBlockedByMonitorAssessmentData(data))
          return <AssessmentBlockedByMonitorPage for={data} />;

        return <AssessmentShowPage for={data} />;
      }}
    </Preload>
  );
};

export default AssessmentShow;
