import { useParams } from 'react-router-dom';
import {
  AssessmentData,
  UnauthenticatedAssessmentData,
} from 'types/course/assessment/assessments';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAssessment } from '../../operations';
import AssessmentAuthenticate from '../AssessmentAuthenticate';

import AssessmentShowPage from './AssessmentShowPage';

const isUnauthenticatedData = (
  data: unknown,
): data is UnauthenticatedAssessmentData =>
  (data as UnauthenticatedAssessmentData)?.isAuthenticated !== undefined;

const AssessmentShow = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id) throw new Error(`AssessmentShow was loaded with ID: ${id}.`);

  const fetchAssessmentWithId = (): Promise<
    AssessmentData | UnauthenticatedAssessmentData
  > => fetchAssessment(id);

  return (
    <Preload render={<LoadingIndicator />} while={fetchAssessmentWithId}>
      {(data): JSX.Element => {
        if (isUnauthenticatedData(data))
          return <AssessmentAuthenticate for={data} />;
        return <AssessmentShowPage for={data} />;
      }}
    </Preload>
  );
};

export default AssessmentShow;
